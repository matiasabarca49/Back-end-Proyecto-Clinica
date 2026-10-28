import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../src/app.js';
import { User } from '../../../src/modules/user/user.model.js';
import { Doctor } from '../../../src/modules/doctor/doctor.model.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser } from '../../../__test__/helpers.tests.js';

let adminToken;
let doctorId;

beforeEach(async () => {
  await clearDB();
  const admin = await createAdminUser();
  adminToken = createAdminToken(admin);
  await createAdminSession(admin);

  // Doctor creado por el flujo real (usuario + ficha)
  const { body } = await request(app)
    .post('/api/users')
    .set('Cookie', `accessToken=${adminToken}`)
    .send({
      name: 'Juan',
      lastName: 'Perez',
      email: 'juan.perez@test.com',
      password: 'Segura123!',
      rol: 'doctor',
      dni: '30111222',
      phone: '2610000000',
      professionalLicense: 'MP-1000',
      color: '#336699',
      frequency: 30,
    })
    .expect(201);
  doctorId = body.data.id;
});

describe('PUT /api/doctors/:id', () => {

  it('un employee no puede modificar la ficha de un doctor', async () => {
    const employee = await User.create({
      name: 'Eva', lastName: 'Lopez', email: 'eva.lopez@test.com', password: 'x', rol: 'employee',
    });
    const employeeToken = createAdminToken(employee);
    await createAdminSession(employee);

    await request(app)
      .put(`/api/doctors/${doctorId}`)
      .set('Cookie', `accessToken=${employeeToken}`)
      .send({ dni: '99999999', professionalLicense: 'MP-9999' })
      .expect(403);

    const doctor = await Doctor.findById(doctorId).lean();
    expect(doctor.dni).toBe('30111222');
    expect(doctor.professionalLicense).toBe('MP-1000');
  });

  it('ignora los datos de la cuenta y el estado, y actualiza los datos profesionales', async () => {
    await request(app)
      .put(`/api/doctors/${doctorId}`)
      .set('Cookie', `accessToken=${adminToken}`)
      .send({ name: 'Otro', email: 'otro@test.com', status: false, phone: '2619999999' })
      .expect(200);

    const doctor = await Doctor.findById(doctorId).lean();
    expect(doctor.phone).toBe('2619999999');
    expect(doctor.name).toBe('Juan');
    expect(doctor.email).toBe('juan.perez@test.com');
    expect(doctor.status).toBe(true);
  });
});

describe('Acceso de un doctor a los datos de otros doctores', () => {
  let doctorToken;
  let otherDoctorId;

  beforeEach(async () => {
    const doctor = await User.findById(doctorId);
    doctorToken = createAdminToken(doctor);
    await createAdminSession(doctor);

    const { body } = await request(app)
      .post('/api/users')
      .set('Cookie', `accessToken=${adminToken}`)
      .send({
        name: 'Ana',
        lastName: 'Gomez',
        email: 'ana.gomez@test.com',
        password: 'Segura123!',
        rol: 'doctor',
        dni: '30333444',
        phone: '2610000001',
        professionalLicense: 'MP-2000',
        color: '#993366',
        frequency: 20,
      })
      .expect(201);
    otherDoctorId = body.data.id;
  });

  it('un doctor solo recibe su propio horario; admin y employee reciben el de todos', async () => {
    const asDoctor = await request(app)
      .get('/api/doctors/schedules')
      .set('Cookie', `accessToken=${doctorToken}`)
      .expect(200);
    expect(asDoctor.body.data.map(d => String(d.id))).toEqual([doctorId]);

    const employee = await User.create({
      name: 'Eva', lastName: 'Lopez', email: 'eva.lopez@test.com', password: 'x', rol: 'employee',
    });
    await createAdminSession(employee);
    const allDoctors = [doctorId, otherDoctorId].sort();

    for (const token of [adminToken, createAdminToken(employee)]) {
      const { body } = await request(app)
        .get('/api/doctors/schedules')
        .set('Cookie', `accessToken=${token}`)
        .expect(200);
      expect(body.data.map(d => String(d.id)).sort()).toEqual(allDoctors);
    }
  });

  it('un doctor no puede listar doctores', async () => {
    await request(app)
      .get('/api/doctors')
      .set('Cookie', `accessToken=${doctorToken}`)
      .expect(403);
  });

  it('un doctor no puede pedir la ficha de otro, exista o no', async () => {
    await request(app)
      .get(`/api/doctors/${otherDoctorId}`)
      .set('Cookie', `accessToken=${doctorToken}`)
      .expect(403);

    // Un id inexistente también da 403 (no 404): un doctor no puede averiguar qué ids existen
    await request(app)
      .get(`/api/doctors/${new mongoose.Types.ObjectId()}`)
      .set('Cookie', `accessToken=${doctorToken}`)
      .expect(403);
  });

  it('un doctor puede pedir su propia ficha', async () => {
    const { body } = await request(app)
      .get(`/api/doctors/${doctorId}`)
      .set('Cookie', `accessToken=${doctorToken}`)
      .expect(200);
    expect(String(body.data.id)).toBe(doctorId);
  });
});

describe('API de Doctores', () => {
  
  describe('GET /api/doctors', () => {
    it('debería retornar un array vacío si no hay doctores', async () => {
      const response = await request(app)
        .get('/api/doctors')
        .set('Cookie', `accessToken=${adminToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body) || Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/users (rol: doctor)', () => {
    it('debería crear un doctor nuevo al crear usuario con rol doctor', async () => {
      const nuevoUsuario = {
        name: 'Carlos',
        lastName: 'González',
        email: 'carlos.gonzalez@hospital.com',
        password: '!securePassword123',
        rol: 'doctor',
        dni: '12345678',
        phone: '1234567890',
        professionalLicense: 'MP12345',
        color: '#ff5733',
        frequency: 60
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(nuevoUsuario)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Carlos');
      expect(response.body.data.lastName).toBe('González');
      expect(response.body.data.email).toBe('carlos.gonzalez@hospital.com');
      expect(response.body.data.rol).toBe('doctor');
    });

    it('debería crear un doctor con horarios personalizados', async () => {
      const usuario = {
        name: 'Luis',
        lastName: 'Rodríguez',
        email: 'luis.rodriguez@hospital.com',
        password: '!securePassword123',
        rol: 'doctor',
        dni: '45678901',
        phone: '1234567890',
        professionalLicense: 'MP67890',
        schedules: {
          monday: { start: '8:00', end: '14:00' },
          tuesday: { start: '8:00', end: '14:00' },
          wednesday: { start: '8:00', end: '14:00' },
          thursday: { start: '8:00', end: '14:00' },
          friday: { start: '8:00', end: '14:00' },
          saturday: { start: '9:00', end: '13:00' }
        },
        color: '#ff5733',
        frequency: 60
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(usuario)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.rol).toBe('doctor');
    });

    it('debería rechazar doctor sin campos requeridos', async () => {
      const usuarioInvalido = {
        name: 'Solo nombre',
        rol: 'doctor'
        // Faltan campos obligatorios
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(usuarioInvalido)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('debería rechazar DNI duplicado', async () => {
      const doctor1 = {
        name: 'Pedro',
        lastName: 'López',
        email: 'pedro@hospital.com',
        password: '!securePassword123',
        rol: 'doctor',
        dni: '1234567',
        phone: '1234567890',
        professionalLicense: 'MP11111',
        color: "#1111",
        frequency: 60
      };

      await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(doctor1)
        .expect(201);

      const doctor2 = {
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@hospital.com',
        password: '!securePassword123',
        rol: 'doctor',
        dni: '1234567', // DNI duplicado
        phone: '1166778899',
        professionalLicense: 'MP22222',
        color: "#1131",
        frequency: 60
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(doctor2)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
    });

    it('debería rechazar matrícula profesional duplicada', async () => {
      const doctor1 = {
        name: 'María',
        lastName: 'García',
        email: 'maria@hospital.com',
        password: '!securePassword123',
        rol: 'doctor',
        dni: '22222222',
        phone: '1234567890',
        professionalLicense: 'MP99999',
        color: "#1111",
        frequency: 60
      };

      await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(doctor1)
        .expect(201);

      const doctor2 = {
        name: 'Laura',
        lastName: 'Fernández',
        email: 'laura@hospital.com',
        password: '!securePassword123',
        rol: 'doctor',
        dni: '33333333',
        phone: '1234567890',
        professionalLicense: 'MP99999', // Matrícula duplicada
        color: "#cf155311",
        frequency: 60
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(doctor2)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/doctors/:id', () => {
    it('debería retornar un doctor por ID', async () => {
      // Crear usuario-doctor
      const nuevoUsuario = {
        name: 'Roberto',
        lastName: 'Sánchez',
        email: 'roberto@hospital.com',
        password: '!securePassword123',
        rol: 'doctor',
        status: 'active',
        dni: '44444444',
        phone: '1234567890',
        professionalLicense: 'MP33333',
        color: "#acd22111",
        frequency: 60
      };

      const crearResponse = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(nuevoUsuario);

      const doctorId = crearResponse.body.data.id;

      // Buscar el doctor
      const response = await request(app)
        .get(`/api/doctors/${doctorId}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200);

      expect(response.body.data.name).toBe('Roberto');
      expect(response.body.data._id || response.body.data.id).toBe(doctorId);
    });
  });

});
