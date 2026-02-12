import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB, clearDB, createAdminUser, getAdminToken } from './setup.js';

// Conectar BD en memoria antes de todos los tests
beforeAll(async () => {
  await connectDB();
  
  await createAdminUser(); // ← Crear admin en BD
  authToken = await getAdminToken(app); // ← Hacer login y obtener token

}, 30000);

// Desconectar después de todos los tests
afterAll(async () => {
  await disconnectDB();
}, 30000);

// Limpiar BD antes de cada test
beforeEach(async () => {
  await clearDB();
  await createAdminUser(); //Crear admin en BD
  authToken = await getAdminToken(app); //Hacer login y obtener token
});

describe('API de Pacientes', () => {
  
  describe('GET /api/patients', () => {
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
        .set('Cookie', `token=${authToken}`)
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
        .set('Cookie', `token=${authToken}`)
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
        .set('Cookie', `token=${authToken}`)
        .send(pacienteInvalido)
        .expect(500);

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
        .set('Cookie', `token=${authToken}`)
        .send(nuevoPaciente);

      const pacienteId = crearResponse.body.data.id;

      // Luego buscarlo
      const response = await request(app)
        .get(`/api/patients/${pacienteId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body.data.name).toBe('Maria');
      expect(response.body.data.id).toBe(pacienteId);
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
        .set('Cookie', `token=${authToken}`)
        .send(paciente);

      const pacienteId = crearResponse.body.data.id;

      // Eliminar
      await request(app)
        .delete(`/api/patients/${pacienteId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      // Verificar que ya no existe
      await request(app)
        .get(`/api/patients/${pacienteId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });
  });

});