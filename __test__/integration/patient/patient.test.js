import request from 'supertest';
import app from '../../../src/app.js';
import { Patient } from '../../../src/modules/patient/patient.model.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser } from '../../helpers.tests.js';

// Conectar BD en memoria antes de todos los tests
beforeAll(async () => {
  const user = await createAdminUser(); // ← Crear admin en BD
  accessToken = createAdminToken(user); // ← Crear el Token a utilizar
  await createAdminSession(user);// ← Crear sesión en Redis para el admin

}, 30000);

let doctorId;

// Limpiar BD antes de cada test
beforeEach(async () => {
  await clearDB();
  const user = await createAdminUser();
  //Creamos token y sesión para cada test, para evitar problemas de expiración o sesiones inactivas en Redis
  accessToken = createAdminToken(user);
  await createAdminSession(user);

  // Doctor real: el paciente tiene que quedar asignado a un doctor existente y activo
  const { body } = await request(app)
    .post('/api/users')
    .set('Cookie', `accessToken=${accessToken}`)
    .send({
      name: 'Juan', lastName: 'Perez', email: 'juan.perez@test.com', password: 'Segura123!', rol: 'doctor',
      dni: '30111222', phone: '2610000000', professionalLicense: 'MP-1000', color: '#336699', frequency: 30,
    })
    .expect(201);
  doctorId = body.data.id;
});

describe('API de Pacientes', () => {
  
  describe('GET /api/patients', () => {
    it('debería retornar un array vacío si no hay pacientes', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Cookie', `accessToken=${accessToken}`) //Usar el token
        .expect('Content-Type', /json/)
        .expect(200);

      // Ajusta según lo que retorna tu API
      expect(Array.isArray(response.body) || Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length === 0)
    });
  });

  describe('POST /api/patients', () => {
    it('no asigna un paciente a un doctor inexistente o dado de baja, ni al crearlo ni al editarlo', async () => {
      const api = (method, url) => request(app)[method](url).set('Cookie', `accessToken=${accessToken}`);
      const paciente = (idDoctor) => ({
        name: 'Sofia', lastName: 'Juarez', birth: '1990-05-15', typeDNI: 'DNI', dni: '12345678', sex: 'female',
        address: 'Calle Falsa 123', phone: '1234567890', email: 'sofia@test.com', medicalCoverage: 'OSDE',
        nAffiliate: 'AFF123456', idDoctor
      });
      const pacienteId = (await api('post', '/api/patients').send(paciente(doctorId)).expect(201)).body.data.id;

      // Doctor inexistente
      await api('post', '/api/patients').send({ ...paciente('507f1f77bcf86cd799439011'), dni: '87654321' }).expect(404);

      // Doctor dado de baja
      await api('delete', `/api/users/${doctorId}`).expect(200);
      await api('post', '/api/patients').send({ ...paciente(doctorId), dni: '87654321' }).expect(404);
      await api('put', `/api/patients/${pacienteId}`).send(paciente(doctorId)).expect(404);
    });

    it('debería crear un paciente nuevo', async () => {
      const nuevoPaciente = {
        name: 'Juan',
        lastName: 'Pérez',
        birth: '1990-05-15',
        typeDNI: 'DNI',
        dni: '12345678',
        sex: 'male',
        address: 'Calle Falsa 123',
        phone: '1234567890',
        email: 'juan@test.com',
        medicalCoverage: 'OSDE',
        nAffiliate: 'AFF123456',
        status: 'active',
        idDoctor: doctorId
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(nuevoPaciente)
        .expect('Content-Type', /json/)
        .expect(201); // Ajusta según tu API (200 o 201)

      // Verifica que se creó correctamente
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Juan');
      expect(response.body.data.lastName).toBe('Pérez');
      expect(response.body.data.email).toBe('juan@test.com');
      expect(response.body.data.dni).toBe('12345678');
    });

    it('debería normalizar el nombre y apellido', async () => {
      const paciente = {
        name: 'juan',
        lastName: 'peReZ',
        birth: '1990-05-15',
        typeDNI: 'DNI',
        dni: '12345678',
        sex: 'male',
        address: 'Calle Falsa 123',
        phone: '1234567890',
        email: 'JUAN@TEST.COM',
        medicalCoverage: 'OSDE',
        nAffiliate: 'AFF123456',
        status: 'active',
        idDoctor: doctorId
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(paciente)
        .expect(201);

      // Verifica normalización
      expect(response.body.data.name).toBe('Juan'); // Capitalizado y sin espacios
      expect(response.body.data.lastName).toBe('Perez'); // Capitalizado
      expect(response.body.data.email).toBe('juan@test.com'); // lowercase
    });

    it('debería rechazar paciente sin campos requeridos', async () => {
      const pacienteInvalido = {
        name: 'Solo nombre'
        // Faltan campos obligatorios
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(pacienteInvalido)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('debería retornar un paciente por ID', async () => {
      // Primero crear un paciente
      const nuevoPaciente = {
        name: 'Maria',
        lastName: 'Splares',
        birth: '1995-10-12',
        typeDNI: 'DNI',
        dni: '12345678',
        sex: 'female',
        address: 'Calle Falsa 123',
        phone: '1234567890',
        email: 'maria@test.com',
        medicalCoverage: 'OSDE',
        nAffiliate: 'AFF123456',
        status: 'active',
        idDoctor: doctorId
      };

      const crearResponse = await request(app)
        .post('/api/patients')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(nuevoPaciente);

      const pacienteId = crearResponse.body.data.id;

      // Luego buscarlo
      const response = await request(app)
        .get(`/api/patients/${pacienteId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(200);

      expect(response.body.data.name).toBe('Maria');
      expect(response.body.data.id).toBe(pacienteId);
    });
  });

  describe('DELETE /api/patients/:patientId/treatment/:idTreatment', () => {
    it('borra un tratamiento existente y responde 404 si el tratamiento no existe', async () => {
      const api = (method, url) => request(app)[method](url).set('Cookie', `accessToken=${accessToken}`);
      const pacienteId = (await api('post', '/api/patients').send({
        name: 'Sofia', lastName: 'Juarez', birth: '1990-05-15', typeDNI: 'DNI', dni: '12345678', sex: 'female',
        address: 'Calle Falsa 123', phone: '1234567890', email: 'sofia@test.com', medicalCoverage: 'OSDE',
        nAffiliate: 'AFF123456', idDoctor: doctorId
      }).expect(201)).body.data.id;
      const { body } = await api('post', `/api/patients/${pacienteId}/treatments`)
        .send({ name: 'Limpieza', dateStart: '2026-10-01', dateEnd: '2026-10-15', status: 'pending' })
        .expect(200);
      const tratamientoId = body.data.treatments[0]._id;

      await api('delete', `/api/patients/${pacienteId}/treatment/507f1f77bcf86cd799439011`).expect(404);
      await api('delete', `/api/patients/${pacienteId}/treatment/${tratamientoId}`).expect(200);
      expect((await Patient.findById(pacienteId).lean()).treatments).toHaveLength(0);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    it('da de baja al paciente sin borrarlo y deja de responder por id', async () => {
      // Crear paciente
      const paciente = {
        name: 'Sofia',
        lastName: 'Juarez',
        birth: '1990-05-15',
        typeDNI: 'DNI',
        dni: '12345678',
        sex: 'female',
        address: 'Calle Falsa 123',
        phone: '1234567890',
        email: 'sofia@test.com',
        medicalCoverage: 'OSDE',
        nAffiliate: 'AFF123456',
        status: 'active',
        idDoctor: doctorId
      };

      const crearResponse = await request(app)
        .post('/api/patients')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(paciente);

      const pacienteId = crearResponse.body.data.id;

      // Eliminar
      await request(app)
        .delete(`/api/patients/${pacienteId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(200);

      // Sigue en la base para no romper sus turnos, pero inactivo
      const patient = await Patient.findById(pacienteId).lean();
      expect(patient.active).toBe(false);

      // Para la API ya no existe: ni se lee ni se edita
      await request(app)
        .get(`/api/patients/${pacienteId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(404);
      await request(app)
        .put(`/api/patients/${pacienteId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .send(paciente)
        .expect(404);
    });

    it('los listados y la búsqueda no devuelven pacientes dados de baja', async () => {
      const crear = (name, dni, email) => request(app)
        .post('/api/patients')
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          name, lastName: 'Juarez', birth: '1990-05-15', typeDNI: 'DNI', dni, sex: 'female',
          address: 'Calle Falsa 123', phone: '1234567890', email, medicalCoverage: 'OSDE',
          nAffiliate: 'AFF123456', idDoctor: doctorId
        })
        .expect(201);
      const baja = (await crear('Sofia', '12345678', 'sofia@test.com')).body.data.id;
      const activo = (await crear('Laura', '87654321', 'laura@test.com')).body.data.id;

      await request(app)
        .delete(`/api/patients/${baja}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(200);

      const get = (url) => request(app).get(url).set('Cookie', `accessToken=${accessToken}`).expect(200);
      const todos = await get('/api/patients');
      const paginado = await get('/api/patients?page=1');
      const busqueda = await get('/api/patients/search?query=juarez');

      expect(todos.body.data.map(p => p.id)).toEqual([activo]);
      expect(paginado.body.data.docs.map(p => p.id)).toEqual([activo]);
      expect(busqueda.body.data.docs.map(p => p.id)).toEqual([activo]);

      // La búsqueda también encuentra por DNI
      const porDni = await get('/api/patients/search?query=87654321');
      expect(porDni.body.data.docs.map(p => p.id)).toEqual([activo]);
    });
  });

});