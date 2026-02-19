import request from 'supertest';
import app from '../src/app.js';
import {clearDB, createAdminUser, getAdminToken } from './helpers.tests.js';

let authToken;

beforeAll(async () => {
  await createAdminUser();
  authToken = await getAdminToken(app);
}, 30000);

beforeEach(async () => {
  await clearDB();
  await createAdminUser();
  authToken = await getAdminToken(app);
});

describe('API de Doctores', () => {
  
  describe('GET /api/doctors', () => {
    it('debería retornar un array vacío si no hay doctores', async () => {
      const response = await request(app)
        .get('/api/doctors')
        .set('Cookie', `token=${authToken}`)
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
        password: 'Test1234!',
        rol: 'doctor',
        status: 'active',
        dni: '23456789',
        phone: '1122334455',
        professionalLicense: 'MP12345'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `token=${authToken}`)
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
        password: 'Test1234!',
        rol: 'doctor',
        status: 'active',
        dni: '45678901',
        phone: '1144556677',
        professionalLicense: 'MP67890',
        schedules: {
          monday: { start: '8:00', end: '14:00' },
          tuesday: { start: '8:00', end: '14:00' },
          wednesday: { start: '8:00', end: '14:00' },
          thursday: { start: '8:00', end: '14:00' },
          friday: { start: '8:00', end: '14:00' },
          saturday: { start: '9:00', end: '13:00' }
        },
        color: '#ff5733'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `token=${authToken}`)
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
        .set('Cookie', `token=${authToken}`)
        .send(usuarioInvalido)
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });

    it('debería rechazar DNI duplicado', async () => {
      const doctor1 = {
        name: 'Pedro',
        lastName: 'López',
        email: 'pedro@hospital.com',
        password: 'Test1234!',
        rol: 'doctor',
        status: 'active',
        dni: '11111111',
        phone: '1155667788',
        professionalLicense: 'MP11111'
      };

      await request(app)
        .post('/api/users')
        .set('Cookie', `token=${authToken}`)
        .send(doctor1)
        .expect(201);

      const doctor2 = {
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@hospital.com',
        password: 'Test1234!',
        rol: 'doctor',
        status: 'active',
        dni: '11111111', // DNI duplicado
        phone: '1166778899',
        professionalLicense: 'MP22222'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `token=${authToken}`)
        .send(doctor2)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
    });

    it('debería rechazar matrícula profesional duplicada', async () => {
      const doctor1 = {
        name: 'María',
        lastName: 'García',
        email: 'maria@hospital.com',
        password: 'Test1234!',
        rol: 'doctor',
        status: 'active',
        dni: '22222222',
        phone: '1177889900',
        professionalLicense: 'MP99999'
      };

      await request(app)
        .post('/api/users')
        .set('Cookie', `token=${authToken}`)
        .send(doctor1)
        .expect(201);

      const doctor2 = {
        name: 'Laura',
        lastName: 'Fernández',
        email: 'laura@hospital.com',
        password: 'Test1234!',
        rol: 'doctor',
        status: 'active',
        dni: '33333333',
        phone: '1188990011',
        professionalLicense: 'MP99999' // Matrícula duplicada
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `token=${authToken}`)
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
        password: 'Test1234!',
        rol: 'doctor',
        status: 'active',
        dni: '44444444',
        phone: '1199001122',
        professionalLicense: 'MP33333'
      };

      const crearResponse = await request(app)
        .post('/api/users')
        .set('Cookie', `token=${authToken}`)
        .send(nuevoUsuario);

      const doctorId = crearResponse.body.data.id;

      // Buscar el doctor
      const response = await request(app)
        .get(`/api/doctors/${doctorId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.data.name).toBe('Roberto');
      expect(response.body.data._id || response.body.data.id).toBe(doctorId);
    });
  });

  describe('DELETE /api/doctors/:id', () => {
    it('debería eliminar un doctor', async () => {
      // Crear usuario-doctor
      const usuario = {
        name: 'Elena',
        lastName: 'Torres',
        email: 'elena@hospital.com',
        password: 'Test1234!',
        rol: 'doctor',
        status: 'active',
        dni: '55555555',
        phone: '1100112233',
        professionalLicense: 'MP44444'
      };

      const crearResponse = await request(app)
        .post('/api/users')
        .set('Cookie', `token=${authToken}`)
        .send(usuario);

      const doctorId = crearResponse.body.data.id;

      // Eliminar
      await request(app)
        .delete(`/api/doctors/${doctorId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      // Verificar que ya no existe
      await request(app)
        .get(`/api/doctors/${doctorId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });
  });

});