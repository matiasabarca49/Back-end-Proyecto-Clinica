import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../src/app.js';
import { Appointment } from '../../../src/modules/appointment/appointment.model.js';
import { Doctor } from '../../../src/modules/doctor/doctor.model.js';
import { Patient } from '../../../src/modules/patient/patient.model.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser } from '../../../__test__/helpers.tests.js';

// Fechas fijas de noviembre de 2026: 01 domingo, 02 lunes, 04 miércoles, 07 sábado
const MONDAY = '2026-11-02';

let adminToken;
let doctorId;
let patientId;
let otherPatientId;

const createPatient = async (dni, email) => {
  const { body } = await request(app)
    .post('/api/patients')
    .set('Cookie', `accessToken=${adminToken}`)
    .send({
      name: 'Ana', lastName: 'Gomez', birth: '1990-05-15', typeDNI: 'DNI', dni, sex: 'female',
      address: 'Calle Falsa 123', phone: '2610000000', email, medicalCoverage: 'OSDE',
      nAffiliate: 'AFF123456', idDoctor: doctorId,
    })
    .expect(201);
  return body.data.id;
};

const book = (fields) => request(app)
  .post('/api/appointments')
  .set('Cookie', `accessToken=${adminToken}`)
  .send({ date: MONDAY, typeAppointment: 'consulta', doctorID: doctorId, patientID: patientId, status: 'confirmed', ...fields });

beforeAll(async () => {
  // El índice único tiene que existir antes del test de concurrencia
  await Appointment.init();
});

beforeEach(async () => {
  await clearDB();
  const admin = await createAdminUser();
  adminToken = createAdminToken(admin);
  await createAdminSession(admin);

  // Doctor creado por el flujo real, con frecuencia de 30 min y el miércoles solo de tarde
  const { body } = await request(app)
    .post('/api/users')
    .set('Cookie', `accessToken=${adminToken}`)
    .send({
      name: 'Juan', lastName: 'Perez', email: 'juan.perez@test.com', password: 'Segura123!', rol: 'doctor',
      dni: '30111222', phone: '2610000000', professionalLicense: 'MP-1000', color: '#336699', frequency: 30,
      schedules: {
        monday: { start: '9:00', end: '18:00' },
        tuesday: { start: '9:00', end: '18:00' },
        wednesday: { start: '14:00', end: '18:00' },
        thursday: { start: '9:00', end: '18:00' },
        friday: { start: '9:00', end: '18:00' },
        saturday: { start: '9:00', end: '13:00' },
      },
    })
    .expect(201);
  doctorId = body.data.id;

  patientId = await createPatient('12345678', 'ana.gomez@test.com');
  otherPatientId = await createPatient('87654321', 'eva.lopez@test.com');
});

describe('POST /api/appointments', () => {

  it.each([
    ['el domingo', { date: '2026-11-01', slots: [600] }, 'El profesional no atiende ese día'],
    ['fuera del horario del día (miércoles a la mañana)', { date: '2026-11-04', slots: [540] }, 'Los slots están fuera del horario del profesional'],
    ['fuera de la grilla de la frecuencia (09:15)', { slots: [555] }, 'Los slots están fuera del horario del profesional'],
    ['slots no consecutivos', { slots: [600, 660] }, 'Los slots de un turno deben ser consecutivos'],
  ])('rechaza un turno %s', async (_case, fields, message) => {
    const res = await book(fields).expect(400);
    expect(res.body.error.message).toBe(message);
  });

  it('solo crea turnos pendientes o confirmados', async () => {
    // Un turno no puede nacer finalizado: saltearía la consulta y el registro del odontograma
    await book({ slots: [600], status: 'finalized' }).expect(400);
    await book({ slots: [600], status: 'pending' }).expect(201);
  });

  it('rechaza turnos de un doctor inactivo y el calendario lo muestra cerrado', async () => {
    await Doctor.updateOne({ _id: doctorId }, { status: false });

    const res = await book({ slots: [600] }).expect(400);
    expect(res.body.error.message).toBe('El profesional está inactivo y no recibe turnos');

    const calendar = await request(app)
      .get(`/api/appointments/availability?doctor=${doctorId}&from=${MONDAY}&to=${MONDAY}`)
      .set('Cookie', `accessToken=${adminToken}`)
      .expect(200);
    expect(calendar.body.data.days[0].status).toBe('closed');
  });

  it('reserva slots consecutivos dentro del horario y guarda la duración del doctor', async () => {
    const res = await book({ slots: [600, 630] }).expect(201);

    expect(res.body.data.duration).toBe(30);
    expect(res.body.data.slotsText).toBe('10:00 - 11:00');
  });

  it('rechaza un turno que se superpone con otro de distinta duración y acepta el contiguo', async () => {
    // Turno de 10:00 a 11:00 reservado cuando el doctor tenía frecuencia de 60 min
    await Appointment.create({
      date: MONDAY, slots: [600], duration: 60, typeAppointment: 'consulta',
      doctorID: doctorId, patientID: otherPatientId, status: 'confirmed',
    });

    const overlapping = await book({ slots: [630] }).expect(400);
    expect(overlapping.body.error.message).toBe('El doctor ya tiene un turno reservado en ese horario');

    await book({ slots: [660] }).expect(201);
  });

  it('el horario de un turno cancelado se puede volver a reservar', async () => {
    const { body } = await book({ slots: [600] }).expect(201);

    await request(app)
      .patch(`/api/appointments/${body.data.id}/status`)
      .set('Cookie', `accessToken=${adminToken}`)
      .send({ status: 'canceled' })
      .expect(200);

    await book({ slots: [600], patientID: otherPatientId }).expect(201);
  });

  it('de dos reservas simultáneas del mismo horario solo se crea una', async () => {
    const results = await Promise.all([
      book({ slots: [600] }),
      book({ slots: [600], patientID: otherPatientId }),
    ]);

    // La rechazada es 400 si el control previo ya ve el otro turno, o 409 si la frena el índice único
    const [created, rejected] = results.map(res => res.status).sort();
    expect(created).toBe(201);
    expect([400, 409]).toContain(rejected);
    expect(await Appointment.countDocuments({ date: MONDAY, slots: 600 })).toBe(1);
  });

  it('rechaza un turno que se superpone con otro del mismo paciente', async () => {
    // Turno del paciente con otro doctor a las 10:00
    await Appointment.create({
      date: MONDAY, slots: [600], duration: 30, typeAppointment: 'consulta',
      doctorID: '676491db50d8d925d49439cc', patientID: patientId, status: 'confirmed',
    });

    const res = await book({ slots: [600] }).expect(400);
    expect(res.body.error.message).toBe('El paciente ya tiene un turno reservado en ese horario');
  });
});

describe('PATCH /api/appointments/:id/status', () => {

  const changeStatus = (id, status) => request(app)
    .patch(`/api/appointments/${id}/status`)
    .set('Cookie', `accessToken=${adminToken}`)
    .send({ status });

  it('no cambia el estado de un turno finalizado', async () => {
    const { body } = await book({ slots: [600] }).expect(201);
    await Appointment.updateOne({ _id: body.data.id }, { status: 'finalized' });

    await changeStatus(body.data.id, 'canceled').expect(409);
  });

  it('no reactiva un turno cancelado si su horario ya fue reservado', async () => {
    const { body } = await book({ slots: [600] }).expect(201);
    await changeStatus(body.data.id, 'canceled').expect(200);
    await book({ slots: [600, 630], patientID: otherPatientId }).expect(201);

    const res = await changeStatus(body.data.id, 'confirmed').expect(400);
    expect(res.body.error.message).toBe('El doctor ya tiene un turno reservado en ese horario');
  });
});

describe('PUT /api/appointments/:id', () => {

  const edit = (id, fields) => request(app)
    .put(`/api/appointments/${id}`)
    .set('Cookie', `accessToken=${adminToken}`)
    .send({ date: MONDAY, typeAppointment: 'consulta', doctorID: doctorId, patientID: patientId, ...fields });

  it('mueve un turno a un horario que se superpone con el suyo propio', async () => {
    // De 10:00-11:00 a 10:30-11:30: el turno no choca consigo mismo
    const { body } = await book({ slots: [600, 630] }).expect(201);

    const res = await edit(body.data.id, { slots: [630, 660] }).expect(201);
    expect(res.body.data.slotsText).toBe('10:30 - 11:30');
  });

  it('no mueve un turno en consulta, pero sí le cambia el consultorio', async () => {
    const { body } = await book({ slots: [600] }).expect(201);
    await Appointment.updateOne({ _id: body.data.id }, { status: 'called' });

    const moved = await edit(body.data.id, { slots: [660] }).expect(409);
    expect(moved.body.error.message).toBe('No se puede cambiar el doctor, el paciente, la fecha ni el horario de un turno en espera o en consulta');

    await edit(body.data.id, { slots: [600], room: 'Consultorio 3' }).expect(201);
  });

  it('rechaza mover un turno a un horario ocupado', async () => {
    const { body } = await book({ slots: [600] }).expect(201);
    await book({ slots: [660], patientID: otherPatientId }).expect(201);

    const res = await edit(body.data.id, { slots: [660] }).expect(400);
    expect(res.body.error.message).toBe('El doctor ya tiene un turno reservado en ese horario');
  });

  it('edita las observaciones aunque el turno ya no esté en la grilla actual del doctor', async () => {
    const { body } = await book({ slots: [570] }).expect(201);
    // Con 60 min de frecuencia, las 09:30 dejan de estar en la grilla del doctor
    await Doctor.updateOne({ _id: doctorId }, { frequency: 60 });

    const res = await edit(body.data.id, { slots: [570], observations: 'Trae radiografía' }).expect(201);
    expect(res.body.data.observations).toBe('Trae radiografía');
    expect(res.body.data.duration).toBe(30);
  });

  it('no permite editar un turno finalizado', async () => {
    const { body } = await book({ slots: [600] }).expect(201);
    await Appointment.updateOne({ _id: body.data.id }, { status: 'finalized' });

    const res = await request(app)
      .put(`/api/appointments/${body.data.id}`)
      .set('Cookie', `accessToken=${adminToken}`)
      .send({ date: MONDAY, slots: [600], typeAppointment: 'consulta', doctorID: doctorId, patientID: patientId, observations: 'cambio' })
      .expect(409);

    expect(res.body.error.message).toBe('Un turno finalizado no se puede modificar');
  });
});

describe('Turnos de otro doctor', () => {

  // Sesiones de dos doctores: el asignado al turno (doctorId) y otro
  const doctorSession = async (_id, email) => {
    const user = { _id, email, rol: 'doctor' };
    await createAdminSession(user);
    return createAdminToken(user);
  };

  let ownerToken;
  let otherToken;
  let otherDoctorId;

  // Diente completo válido (toothSchema): pasa la validación del body y llega al control de dueño
  const tooth = {
    tooth: 16,
    caries: { vestibular: '0', mesial: '0', oclusal: '1', distal: '0', lingual: '0' },
    corona: false, extracted: false, allcaries: false, incurable: false,
    malposition: false, periodontal: false, inscrustration: false,
  };

  beforeEach(async () => {
    const { body } = await request(app)
      .post('/api/users')
      .set('Cookie', `accessToken=${adminToken}`)
      .send({
        name: 'Mara', lastName: 'Ruiz', email: 'mara.ruiz@test.com', password: 'Segura123!', rol: 'doctor',
        dni: '30222333', phone: '2610000002', professionalLicense: 'MP-3000', color: '#993366', frequency: 30,
      })
      .expect(201);

    otherDoctorId = body.data.id;
    ownerToken = await doctorSession(doctorId, 'juan.perez@test.com');
    otherToken = await doctorSession(otherDoctorId, 'mara.ruiz@test.com');
  });

  it.each([
    ['ver', (id) => request(app).get(`/api/appointments/${id}`)],
    ['editar', (id) => request(app).put(`/api/appointments/${id}`)
      .send({ date: MONDAY, slots: [600], typeAppointment: 'consulta', doctorID: doctorId, patientID: patientId })],
    ['hacer check-in de', (id) => request(app).patch(`/api/appointments/${id}/check-in`)],
    ['llamar', (id) => request(app).patch(`/api/appointments/${id}/call`)],
    ['finalizar', (id) => request(app).patch(`/api/appointments/${id}/finalize`)],
    ['ver el odontograma de', (id) => request(app).get(`/api/appointments/${id}/odontogram`)],
    ['cargar un diente en', (id) => request(app).post(`/api/appointments/${id}/odontogram`).send(tooth)],
  ])('un doctor no puede %s un turno de otro doctor', async (_action, send) => {
    const { body } = await book({ slots: [600] }).expect(201);

    await send(body.data.id).set('Cookie', `accessToken=${otherToken}`).expect(403);
    // El doctor asignado sí puede ver su turno
    await request(app).get(`/api/appointments/${body.data.id}`).set('Cookie', `accessToken=${ownerToken}`).expect(200);
  });

  it('un doctor no puede pasarle su turno a otro doctor', async () => {
    const { body } = await book({ slots: [600] }).expect(201);

    await request(app)
      .put(`/api/appointments/${body.data.id}`)
      .set('Cookie', `accessToken=${ownerToken}`)
      .send({ date: MONDAY, slots: [600], typeAppointment: 'consulta', doctorID: otherDoctorId, patientID: patientId })
      .expect(403);
  });

  it.each([
    ['la grilla', (id) => `/api/appointments/available/${id}?day=${MONDAY}`],
    ['la disponibilidad', (id) => `/api/appointments/availability?doctor=${id}&from=${MONDAY}&to=${MONDAY}`],
    ['el turno libre más cercano', (id) => `/api/appointments/nearest/${id}`],
  ])('un doctor no puede consultar %s de otro doctor, pero sí la suya', async (_what, url) => {
    await request(app).get(url(doctorId)).set('Cookie', `accessToken=${otherToken}`).expect(403);
    // Un id inexistente también da 403 (no 404): un doctor no puede averiguar qué ids existen
    await request(app).get(url(new mongoose.Types.ObjectId())).set('Cookie', `accessToken=${otherToken}`).expect(403);
    await request(app).get(url(doctorId)).set('Cookie', `accessToken=${ownerToken}`).expect(200);

    // Employee no es doctor: consulta la disponibilidad de cualquiera
    const employee = { _id: new mongoose.Types.ObjectId(), email: 'eva.lopez@test.com', rol: 'employee' };
    await createAdminSession(employee);
    await request(app).get(url(doctorId)).set('Cookie', `accessToken=${createAdminToken(employee)}`).expect(200);
  });

  it('un doctor no puede reservar un turno a nombre de otro doctor', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Cookie', `accessToken=${otherToken}`)
      .send({ date: MONDAY, slots: [600], typeAppointment: 'consulta', doctorID: doctorId, patientID: patientId, status: 'confirmed' })
      .expect(403);
  });
});

describe('PATCH /api/appointments/:id/finalize', () => {

  const tooth = (number, oclusal) => ({
    tooth: number,
    caries: { vestibular: '0', mesial: '0', oclusal, distal: '0', lingual: '0' },
    corona: false, extracted: false, allcaries: false, incurable: false,
    malposition: false, periodontal: false, inscrustration: false,
  });

  it('guarda el odontograma del turno en el paciente y finaliza el turno', async () => {
    // El paciente ya tiene el 11; en el turno se carga el 21
    await Patient.updateOne({ _id: patientId }, { dentalStatus: [tooth(11, '1')] });
    const { body } = await book({ slots: [600] }).expect(201);
    const id = body.data.id;
    await Appointment.updateOne({ _id: id }, { status: 'called' });

    await request(app)
      .post(`/api/appointments/${id}/odontogram`)
      .set('Cookie', `accessToken=${adminToken}`)
      .send(tooth(21, '2'))
      .expect(200);

    await request(app)
      .patch(`/api/appointments/${id}/finalize`)
      .set('Cookie', `accessToken=${adminToken}`)
      .expect(200);

    const patient = await Patient.findById(patientId).lean();
    const teeth = Object.fromEntries(patient.dentalStatus.map(t => [t.tooth, t.caries.oclusal]));
    expect(teeth).toEqual({ 11: '1', 21: '2' });
    expect((await Appointment.findById(id).lean()).status).toBe('finalized');
  });
});

describe('Entradas de texto', () => {

  it('rechaza un consultorio que no es texto', async () => {
    await book({ slots: [600], room: { $ne: '' } }).expect(400);
  });

  it('busca por consultorio con caracteres especiales sin romper la búsqueda', async () => {
    // Sin escapar, "(" arma una expresión regular inválida y la respuesta es 500
    await book({ slots: [600], room: 'Consultorio (2)' }).expect(201);

    const res = await request(app)
      .get('/api/appointments?room=(')
      .set('Cookie', `accessToken=${adminToken}`)
      .expect(200);
    expect(res.body.data.docs).toHaveLength(1);
  });
});

describe('GET /api/appointments/available/:id y /nearest/:id', () => {

  it('/available devuelve la grilla del horario de ese día separada en libres y ocupados', async () => {
    // Miércoles de 14:00 a 18:00, con 15:00 a 16:00 ocupado
    await book({ date: '2026-11-04', slots: [900, 930] }).expect(201);

    const res = await request(app)
      .get(`/api/appointments/available/${doctorId}?day=2026-11-04`)
      .set('Cookie', `accessToken=${adminToken}`)
      .expect(200);

    expect(res.body.data).toEqual({
      date: '2026-11-04',
      duration: 30,
      slots: [840, 870, 960, 990, 1020, 1050],
      occupiedSlots: [900, 930],
    });
  });

  it('/nearest termina y responde 404 si el doctor no tiene lugar en el período de búsqueda', async () => {
    // Inactivo: ningún día tiene slots, así que recorre todo el período
    await Doctor.updateOne({ _id: doctorId }, { status: false });

    await request(app)
      .get(`/api/appointments/nearest/${doctorId}`)
      .set('Cookie', `accessToken=${adminToken}`)
      .expect(404);
  });
});

describe('GET /api/appointments/availability', () => {

  it('devuelve cada día del rango con los slots del horario, los ocupados y los libres', async () => {
    // Lunes: 10:00 a 11:00 ocupado y un cancelado a las 09:00, que no cuenta
    await book({ slots: [600, 630] }).expect(201);
    await Appointment.create({
      date: MONDAY, slots: [540], duration: 30, typeAppointment: 'consulta',
      doctorID: doctorId, patientID: otherPatientId, status: 'canceled',
    });
    // Sábado de 09:00 a 13:00 (8 slots), todo ocupado
    await book({ date: '2026-11-07', slots: [540, 570, 600, 630, 660, 690, 720, 750] }).expect(201);

    const res = await request(app)
      .get(`/api/appointments/availability?doctor=${doctorId}&from=2026-11-01&to=2026-11-07`)
      .set('Cookie', `accessToken=${adminToken}`)
      .expect(200);

    const days = Object.fromEntries(res.body.data.days.map(day => [day.date, day]));

    expect(res.body.data.days).toHaveLength(7);
    expect(days['2026-11-01']).toEqual({ date: '2026-11-01', status: 'closed', total: 0, occupied: 0, free: 0 });
    expect(days[MONDAY]).toEqual({ date: MONDAY, status: 'available', total: 18, occupied: 2, free: 16 });
    expect(days['2026-11-04']).toEqual({ date: '2026-11-04', status: 'available', total: 8, occupied: 0, free: 8 });
    expect(days['2026-11-07']).toEqual({ date: '2026-11-07', status: 'full', total: 8, occupied: 8, free: 0 });
  });
});

describe('Turnos con doctor o paciente dado de baja', () => {

  it('no reserva turnos con un paciente o un doctor dado de baja: para turnos no existen', async () => {
    const api = (method, url) => request(app)[method](url).set('Cookie', `accessToken=${adminToken}`);

    await api('delete', `/api/patients/${patientId}`).expect(200);
    await book({ slots: [600] }).expect(404);

    await api('delete', `/api/users/${doctorId}`).expect(200);
    await book({ slots: [600], patientID: otherPatientId }).expect(404);

    // Tampoco muestra disponibilidad
    await api('get', `/api/appointments/availability?doctor=${doctorId}&from=${MONDAY}&to=${MONDAY}`).expect(404);
    await api('get', `/api/appointments/available/${doctorId}?day=${MONDAY}`).expect(404);
    // 404 por el doctor, no por falta de turnos libres
    const nearest = await api('get', `/api/appointments/nearest/${doctorId}`).expect(404);
    expect(nearest.body.error.message).toBe(`Doctor con ID ${doctorId} no encontrado`);
  });

  it.each(['waiting', 'called'])('un turno %s (paciente en sala o en consulta) también impide la baja', async (status) => {
    const api = (method, url) => request(app)[method](url).set('Cookie', `accessToken=${adminToken}`);
    await Appointment.create({
      date: MONDAY, slots: [600], duration: 30, typeAppointment: 'consulta',
      doctorID: doctorId, patientID: patientId, status,
    });

    await api('delete', `/api/patients/${patientId}`).expect(409);
    await api('delete', `/api/users/${doctorId}`).expect(409);
  });

  it('no da de baja a un doctor ni a un paciente con turnos sin cerrar, aunque sean de días pasados', async () => {
    const api = (method, url) => request(app)[method](url).set('Cookie', `accessToken=${adminToken}`);
    // Turno de un día pasado que nadie cerró: sigue abierto y se podría finalizar
    const { _id } = await Appointment.create({
      date: '2026-10-01', slots: [600], duration: 30, typeAppointment: 'consulta',
      doctorID: doctorId, patientID: patientId, status: 'confirmed',
    });

    const doctor = await api('delete', `/api/users/${doctorId}`).expect(409);
    expect(doctor.body.error.message).toBe('El profesional tiene turnos sin cerrar. Cancele, reasigne o marque como ausente sus turnos antes de darlo de baja');
    const patient = await api('delete', `/api/patients/${patientId}`).expect(409);
    expect(patient.body.error.message).toBe('El paciente tiene turnos sin cerrar. Cancele o marque como ausente sus turnos antes de darlo de baja');

    // La transacción revierte la baja del usuario: doctor y ficha siguen activos
    await api('get', `/api/users/${doctorId}`).expect(200);
    await api('get', `/api/doctors/${doctorId}`).expect(200);

    // Cerrado el turno (cancelado), ya se pueden dar de baja
    await api('patch', `/api/appointments/${_id}/status`).send({ status: 'canceled' }).expect(200);
    await api('delete', `/api/patients/${patientId}`).expect(200);
    await api('delete', `/api/users/${doctorId}`).expect(200);
  });

  it.each(['noshow', 'rescheduled'])('un turno cancelado de un paciente dado de baja no se puede pasar a %s', async (status) => {
    const api = (method, url) => request(app)[method](url).set('Cookie', `accessToken=${adminToken}`);
    // Cancelado: libera su horario y no frena la baja. Pasar a ausente o reprogramado lo vuelve a ocupar
    const { _id } = await Appointment.create({
      date: MONDAY, slots: [600], duration: 30, typeAppointment: 'consulta',
      doctorID: doctorId, patientID: patientId, status: 'canceled',
    });
    await api('delete', `/api/patients/${patientId}`).expect(200);

    await api('patch', `/api/appointments/${_id}/status`).send({ status }).expect(404);
    expect((await Appointment.findById(_id).lean()).status).toBe('canceled');
  });

  it.each(['noshow', 'rescheduled'])('un turno %s de un paciente dado de baja no se puede volver a confirmar', async (status) => {
    const api = (method, url) => request(app)[method](url).set('Cookie', `accessToken=${adminToken}`);
    // Cerrado como ausente o reprogramado: no frena la baja del paciente
    const { _id } = await Appointment.create({
      date: MONDAY, slots: [600], duration: 30, typeAppointment: 'consulta',
      doctorID: doctorId, patientID: patientId, status,
    });
    await api('delete', `/api/patients/${patientId}`).expect(200);

    await api('patch', `/api/appointments/${_id}/status`).send({ status: 'confirmed' }).expect(404);
    expect((await Appointment.findById(_id).lean()).status).toBe(status);
  });

  it('el turno sigue trayendo a su doctor y paciente, y se encuentra por el nombre del paciente', async () => {
    // Turno ya atendido: es historial y no impide la baja
    const { _id } = await Appointment.create({
      date: '2026-10-01', slots: [600], duration: 30, typeAppointment: 'consulta',
      doctorID: doctorId, patientID: patientId, status: 'finalized',
    });
    const appointmentId = String(_id);

    const api = (method, url) => request(app)[method](url).set('Cookie', `accessToken=${adminToken}`);
    await api('delete', `/api/patients/${patientId}`).expect(200);
    await api('delete', `/api/users/${doctorId}`).expect(200);

    const res = await api('get', `/api/appointments/${appointmentId}`).expect(200);
    expect(res.body.data.patientID._id).toBe(patientId);
    expect(res.body.data.doctorID._id).toBe(doctorId);

    const found = await api('get', '/api/appointments?patient=gomez').expect(200);
    expect(found.body.data.docs.map(a => a.id)).toEqual([appointmentId]);
  });
});

describe('API de Appointments', () => {
  
  describe('GET /api/appointments', () => {
    it('debería retornar un array vacío si no hay turnos', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Cookie', `accessToken=${adminToken}`) //Usar el token
        .expect('Content-Type', /json/)
        .expect(200);

      // Ajusta según lo que retorna tu API
      expect(Array.isArray(response.body) || Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length === 0)
    });
  });

  describe('POST /api/appointments', () => {
    it('debería crear un paciente, un doctor y asignar un turno nuevo', async () => {

        const nuevoUsuario = {
                name: 'Carlos',
                lastName: 'González',
                email: 'carlos.gonzalez@hospital.com',
                password: '!securePassword123',
                rol: 'doctor',
                dni: '1234567',
                phone: '1234567890',
                professionalLicense: 'MP12345',
                color: "#b0464611",
                frequency: 30,

            };
        
        const responseUser = await request(app)
            .post('/api/users')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(nuevoUsuario)
            .expect(201);
        
        const idUser = responseUser.body.data.id;

        //Agregando Paciente
        const paciente = {
            name: 'juan',
            lastName: 'peReZ',
            birth: '1990-05-15',
            typeDNI: 'DNI',
            dni: '11222333',
            sex: 'male',
            address: 'Calle Falsa 123',
            phone: '1234567890',
            email: 'JUAN@TEST.COM',
            medicalCoverage: 'OSDE',
            nAffiliate: 'AFF123456',
            idDoctor: idUser // ID válido de Mongo
        };

        const responsePaciente = await request(app)
        .post('/api/patients')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(paciente)
        .expect(201);

        const patientId = responsePaciente.body.data.id;

        const nuevoTurno = {
                date: '2026-11-02', // Lunes: el doctor atiende con el horario por defecto
                slots: [540], // 09:00
                typeAppointment: "consulta",
                room: "Consultorio 1",
                doctorID: idUser,
                patientID: patientId,
                status: "confirmed",
                observations: ""     
        }

        const responseTurno = await request(app)
        .post('/api/appointments')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(nuevoTurno)
        .expect(201);

        // Verifica que se creó correctamente
        expect(responseTurno.body.data).toHaveProperty('id');
        expect(responseTurno.body.data).toHaveProperty('slotsText');
        expect(responseTurno.body.data).toHaveProperty('patientID');
        expect(responseTurno.body.data).toHaveProperty('doctorID');
        expect(responseTurno.body.data.patientID.id).toBe(patientId);
        expect(responseTurno.body.data.doctorID.id).toBe(idUser);
    });


    describe('GET /api/appointments/:id', () => {
        it('debería retornar un turno por ID', async () => {
            const nuevoUsuario = {
                    name: 'Carlos',
                    lastName: 'González',
                    email: 'carlos.gonzalez@hospital.com',
                    password: '!securePassword123',
                    rol: 'doctor',
                    dni: '12345678',
                    phone: '1234567890',
                    professionalLicense: 'MP12345',
                    color: "#b4c12311",
                    frequency: 30
                };
            
            const responseUser = await request(app)
                .post('/api/users')
                .set('Cookie', `accessToken=${adminToken}`)
                .send(nuevoUsuario)
                .expect(201);
            
            const idUser = responseUser.body.data.id;

            //Agregando Paciente
            const paciente = {
                name: 'juan',
                lastName: 'peReZ',
                birth: '1990-05-15',
                typeDNI: 'DNI',
                dni: '11222333',
                sex: 'male',
                address: 'Calle Falsa 123',
                phone: '1234567890',
                email: 'JUAN@TEST.COM',
                medicalCoverage: 'OSDE',
                nAffiliate: 'AFF123456',
                idDoctor: idUser // ID válido de Mongo
            };

            const responsePaciente = await request(app)
            .post('/api/patients')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(paciente)
            .expect(201);

            const patientId = responsePaciente.body.data.id;

            const nuevoTurno = {
                    date: '2026-11-02', // Lunes
                    slots: [540], // 09:00
                    typeAppointment: "consulta",
                    room: "Consultorio 1",
                    doctorID: idUser,
                    patientID: patientId,
                    status: "confirmed",
                    observations: ""     
            }

            const responseTurno = await request(app)
            .post('/api/appointments')
            .set('Cookie', `accessToken=${adminToken}`)
            .send(nuevoTurno)
            .expect(201);

            const idTurno = responseTurno.body.data.id
    
            // Luego buscarlo
            const response = await request(app)
            .get(`/api/appointments/${idTurno}`)
            .set('Cookie', `accessToken=${adminToken}`)
            .expect(200);

            // Verifica que se creó correctamente
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('slotsText');
            expect(response.body.data).toHaveProperty('patientID');
            expect(response.body.data).toHaveProperty('doctorID');
            expect(response.body.data).toHaveProperty('created');
            expect(response.body.data.patientID._id).toBe(patientId);
            expect(response.body.data.doctorID._id).toBe(idUser);
            expect(response.body.data.id).toBe(idTurno);
        });
    
        
      });

 })
});
