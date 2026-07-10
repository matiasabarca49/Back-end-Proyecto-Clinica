import request from 'supertest';
import app from '../src/app.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser} from './helpers.tests.js';

let accessToken;

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

describe('API de Users', () => {
  
  describe('GET /api/users', () => {
    it('debería retornar un array vacío si no hay pacientes', async () => {

      const response = await request(app)
        .get('/api/patients')
        .set('Cookie', `accessToken=${accessToken}`) //Usar el token de acceso
        .expect('Content-Type', /json/)
        .expect(200);

      // Ajusta según lo que retorna tu API
      expect(Array.isArray(response.body) || Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length === 0)
    });
  });

  describe('POST /api/users', () => {
    it('debería crear un paciente nuevo', async () => {
      const nuevoUsuario = {
            name: "Armando",
            lastName: "Sofalto",
            email: "armando@example.com",
            password: "!securePassword123",
            rol: "employee",
       }

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(nuevoUsuario)
        .expect('Content-Type', /json/)
        .expect(201); // Ajusta según tu API (200 o 201)

      // Verifica que se creó correctamente
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Armando');
      expect(response.body.data.lastName).toBe('Sofalto');
      expect(response.body.data.email).toBe('armando@example.com');
      expect(response.body.data.rol).toBe('employee');
    });

    it('debería normalizar el nombre y apellido', async () => {
      const nuevoUsuario = {
            name: "ARMANDO",
            lastName: "SOfalto",
            email: "ARMANDO@EXAMPLE.COM",
            password: "!securePassword123",
            rol: "employee",
       };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(nuevoUsuario)
        .expect(201);

      // Verifica normalización
      expect(response.body.data.name).toBe('Armando'); // Capitalizado y sin espacios
      expect(response.body.data.lastName).toBe('Sofalto'); // Capitalizado
      expect(response.body.data.email).toBe('armando@example.com'); // lowercase
    });

    it('debería rechazar paciente sin campos requeridos', async () => {
      const usuarioInvalido = {
        name: 'Solo nombre'
        // Faltan campos obligatorios
      };

      const response = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(usuarioInvalido)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

  });

  describe('GET /api/users/:id', () => {
    it('debería retornar un usuario por ID', async () => {
      // Primero crear un paciente
      const nuevoUsuario = {
            name: "Armando",
            lastName: "Sofalto",
            email: "armando@example.com",
            password: "!securePassword123",
            rol: "employee",
       };

      const crearResponse = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(nuevoUsuario);

      const usuarioId = crearResponse.body.data.id;

      // Luego buscarlo
      const response = await request(app)
        .get(`/api/users/${usuarioId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(200);

      expect(response.body.data.name).toBe('Armando');
      expect(response.body.data.id).toBe(usuarioId);
    });

  });


  describe('DELETE /api/users/:id', () => {
    it('debería eliminar un usuario', async () => {
      // Crear paciente
      const usuario = {
            name: "Armando",
            lastName: "Sofalto",
            email: "armando@example.com",
            password: "!securePassword123",
            rol: "employee",
       };

      const crearResponse = await request(app)
        .post('/api/users')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(usuario);

      const usuarioId = crearResponse.body.data.id;

      // Eliminar
      await request(app)
        .delete(`/api/users/${usuarioId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(200);

      // Verificar que ya no existe
      await request(app)
        .get(`/api/users/${usuarioId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(404);
    });
  });

});