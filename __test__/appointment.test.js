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

describe('API de Appointments', () => {
  
  describe('GET /api/appointments', () => {
    it('debería retornar un array vacío si no hay turnos', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Cookie', `token=${authToken}`) //Usar el token
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
                password: 'Test1234!',
                rol: 'doctor',
                dni: '23456789',
                phone: '1122334455',
                professionalLicense: 'MP12345'
            };
        
        const responseUser = await request(app)
            .post('/api/users')
            .set('Cookie', `token=${authToken}`)
            .send(nuevoUsuario)
            .expect(201);
        
        const idUser = responseUser.body.data.id;

        //Agregando Paciente
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
            idDoctor: idUser // ID válido de Mongo
        };

        const responsePaciente = await request(app)
        .post('/api/patients')
        .set('Cookie', `token=${authToken}`)
        .send(paciente)
        .expect(201);

        const patientId = responsePaciente.body.data.id;

        const nuevoTurno = {
                date: new Date(),
                slots: [0],
                typeAppointment: "consulta",
                room: "Consultorio 1",
                doctorID: idUser,
                patientID: patientId,
                status: "confirmed",
                observations: ""     
        }

        const responseTurno = await request(app)
        .post('/api/appointments')
        .set('Cookie', `token=${authToken}`)
        .send(nuevoTurno)
        .expect(201);

        // Verifica que se creó correctamente
        expect(responseTurno.body.data).toHaveProperty('id');
        expect(responseTurno.body.data).toHaveProperty('slotsText');
        expect(responseTurno.body.data).toHaveProperty('patientID');
        expect(responseTurno.body.data).toHaveProperty('doctorID');
        expect(responseTurno.body.data).toHaveProperty('created');
        expect(responseTurno.body.data.patientID).toBe(patientId);
        expect(responseTurno.body.data.doctorID).toBe(idUser);
    });


    describe('GET /api/patients/:id', () => {
        it('debería retornar un paciente por ID', async () => {
            const nuevoUsuario = {
                    name: 'Carlos',
                    lastName: 'González',
                    email: 'carlos.gonzalez@hospital.com',
                    password: 'Test1234!',
                    rol: 'doctor',
                    dni: '23456789',
                    phone: '1122334455',
                    professionalLicense: 'MP12345'
                };
            
            const responseUser = await request(app)
                .post('/api/users')
                .set('Cookie', `token=${authToken}`)
                .send(nuevoUsuario)
                .expect(201);
            
            const idUser = responseUser.body.data.id;

            //Agregando Paciente
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
                idDoctor: idUser // ID válido de Mongo
            };

            const responsePaciente = await request(app)
            .post('/api/patients')
            .set('Cookie', `token=${authToken}`)
            .send(paciente)
            .expect(201);

            const patientId = responsePaciente.body.data.id;

            const nuevoTurno = {
                    date: new Date(),
                    slots: [0],
                    typeAppointment: "consulta",
                    room: "Consultorio 1",
                    doctorID: idUser,
                    patientID: patientId,
                    status: "confirmed",
                    observations: ""     
            }

            const responseTurno = await request(app)
            .post('/api/appointments')
            .set('Cookie', `token=${authToken}`)
            .send(nuevoTurno)
            .expect(201);

            const idTurno = responseTurno.body.data.id
    
            // Luego buscarlo
            const response = await request(app)
            .get(`/api/appointments/${idTurno}`)
            .set('Cookie', `token=${authToken}`)
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