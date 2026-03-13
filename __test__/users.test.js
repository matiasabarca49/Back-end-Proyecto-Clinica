import request from 'supertest';
import app from '../src/app.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser} from './helpers.tests.js';

// Conectar BD en memoria antes de todos los tests
beforeAll(async () => {
  const user = await createAdminUser(); // ← Crear admin en BD
  authToken = createAdminToken(user); // ← Crear el Token a utilizar
  await createAdminSession(user);// ← Crear sesión en Redis para el admin

}, 30000);

// Limpiar BD antes de cada test
beforeEach(async () => {
  await clearDB();
  const user = await createAdminUser();
  //Creamos token y sesión para cada test, para evitar problemas de expiración o sesiones inactivas en Redis
  authToken = createAdminToken(user);
  await createAdminSession(user);
  /* await createAdminUser(); //Crear admin en BD */
  /* authToken = await getAdminToken(app); //Hacer login y obtener token */
});

describe('API de Users', () => {
  
  describe('GET /api/users', () => {
    it('debería retornar un array vacío si no hay pacientes', async () => {

      const response = await request(app)
        .get('/api/patients')
        .set('Cookie', `token=${authToken}`) //Usar el token
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
        .set('Cookie', `token=${authToken}`)
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
        .set('Cookie', `token=${authToken}`)
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
        .set('Cookie', `token=${authToken}`)
        .send(usuarioInvalido)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    /* it('debería rechazar email inválido', async () => {
      const paciente = {
        name: 'Test',
        lastName: 'Usuario',
        birth: '1990-05-15',
        dni: '11111111',
        sex: 'M',
        phone: '1234567890',
        email: 'email-invalido', // Email sin @
      };

      await request(app)
        .post('/api/patients')
        .send(paciente)
        .expect(400);
    }); */
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
        .set('Cookie', `token=${authToken}`)
        .send(nuevoUsuario);

      const usuarioId = crearResponse.body.data.id;

      // Luego buscarlo
      const response = await request(app)
        .get(`/api/users/${usuarioId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.data.name).toBe('Armando');
      expect(response.body.data.id).toBe(usuarioId);
    });

    /* it('debería retornar 404 si el paciente no existe', async () => {
      const idInexistente = '507f1f77bcf86cd799439011';

      await request(app)
        .get(`/api/patients/${idInexistente}`)
        .expect(404);
    }); */
  });

  /* describe('PUT /api/patients/:id', () => {
    it('debería actualizar un paciente existente', async () => {
      // Crear paciente
      const paciente = {
        name: 'Armando',
        lastName: 'peReZ',
        birth: '1990-05-15',
        typeDNI: 'DNI',
        dni: '12345678',
        sex: 'M',
        address: 'Calle Falsa 123',
        phone: '1234567890',
        email: 'ARMANDO@TEST.COM',
        medicalCoverage: 'OSDE',
        nAffiliate: 'AFF123456',
        status: 'active',
        idDoctor: '507f1f77bcf86cd799439011' // ID válido de Mongo
      };

      const crearResponse = await request(app)
        .post('/api/patients')
        .send(paciente);

      const pacienteId = crearResponse.body.id;

      // Actualizar teléfono
      const datosActualizados = {
        phone: '9999999999',
        lastName: "Rato"
      };

      const response = await request(app)
        .put(`/api/patients/${pacienteId}`)
        .send(datosActualizados)
        .expect(200);

      expect(response.body.phone).toBe('9999999999');
      expect(response.body.name).toBe('Armando'); // Otros campos sin cambios
      expect(response.body.lastName).toBe('Rato'); // Otros campos sin cambios
    });
  }); */

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
        .set('Cookie', `token=${authToken}`)
        .send(usuario);

      const usuarioId = crearResponse.body.data.id;

      // Eliminar
      await request(app)
        .delete(`/api/users/${usuarioId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      // Verificar que ya no existe
      await request(app)
        .get(`/api/users/${usuarioId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });
  });

});