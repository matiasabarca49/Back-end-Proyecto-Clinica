import request from 'supertest';
import app from '../src/app.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser } from './helpers.tests.js';

// Conectar BD en memoria antes de todos los tests
beforeAll(async () => {
  const user = await createAdminUser(); // ← Crear admin en BD
  accessToken = createAdminToken(user); // ← Crear el Token a utilizar
  await createAdminSession(user);// ← Crear sesión en Redis para el admin

}, 30000);

// Limpiar BD antes de cada test
beforeEach(async () => {
  await clearDB();
  const user = await createAdminUser();
  //Creamos token y sesión para cada test, para evitar problemas de expiración o sesiones inactivas en Redis
  accessToken = createAdminToken(user);
  await createAdminSession(user);
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
        idDoctor: '507f1f77bcf86cd799439011' // ID válido de Mongo
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
        idDoctor: '507f1f77bcf86cd799439011' // ID válido de Mongo
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
        idDoctor: '507f1f77bcf86cd799439011' // ID válido de Mongo
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

  describe('DELETE /api/patients/:id', () => {
    it('debería eliminar un paciente', async () => {
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
        idDoctor: '507f1f77bcf86cd799439011' // ID válido de Mongo
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

      // Verificar que ya no existe
      await request(app)
        .get(`/api/patients/${pacienteId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(404);
    });
  });

});