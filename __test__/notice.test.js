import request from 'supertest';
import app from '../src/app.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser } from './helpers.tests.js';

let authToken;

// Notice válido base para reutilizar en los tests
const noticeBase = {
    title: "Aviso de prueba",
    description: "Descripción del aviso de prueba",
    date: "2024-01-01",
    type: "info",
    priority: "medium",
    visibility: "general"
};

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
});

describe('API de Notices', () => {

    describe('GET /api/notices', () => {
        it('debería retornar un array vacío si no hay avisos', async () => {
            const response = await request(app)
                .get('/api/notices')
                .set('Cookie', `token=${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });

        it('debería retornar los avisos existentes', async () => {
            // Crear un aviso primero
            await request(app)
                .post('/api/notices')
                .set('Cookie', `token=${authToken}`)
                .send(noticeBase);

            const response = await request(app)
                .get('/api/notices')
                .set('Cookie', `token=${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/notices', () => {
        it('debería crear un aviso nuevo', async () => {
            const response = await request(app)
                .post('/api/notices')
                .set('Cookie', `token=${authToken}`)
                .send(noticeBase)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe('Aviso de prueba');
            expect(response.body.data.type).toBe('info');
            expect(response.body.data.priority).toBe('medium');
            expect(response.body.data.visibility).toBe('general');
        });

        it('debería rechazar un aviso sin campos requeridos', async () => {
            const noticeInvalido = { title: 'Solo titulo' };

            const response = await request(app)
                .post('/api/notices')
                .set('Cookie', `token=${authToken}`)
                .send(noticeInvalido)
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/notices/:id', () => {
        it('debería retornar un aviso por ID', async () => {
            const crearResponse = await request(app)
                .post('/api/notices')
                .set('Cookie', `token=${authToken}`)
                .send(noticeBase);

            const noticeId = crearResponse.body.data.id;

            const response = await request(app)
                .get(`/api/notices/${noticeId}`)
                .set('Cookie', `token=${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(noticeId);
            expect(response.body.data.title).toBe('Aviso de prueba');
        });

        it('debería retornar 404 si el aviso no existe', async () => {
            const idInexistente = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/notices/${idInexistente}`)
                .set('Cookie', `token=${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/notices/:id', () => {
        it('debería actualizar un aviso existente', async () => {
            const crearResponse = await request(app)
                .post('/api/notices')
                .set('Cookie', `token=${authToken}`)
                .send(noticeBase);

            const noticeId = crearResponse.body.data.id;

            const response = await request(app)
                .put(`/api/notices/${noticeId}`)
                .set('Cookie', `token=${authToken}`)
                .send({ title: 'Título actualizado', priority: 'high' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Título actualizado');
            expect(response.body.data.priority).toBe('high');
        });

        it('debería retornar 404 al actualizar un aviso inexistente', async () => {
            const idInexistente = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .put(`/api/notices/${idInexistente}`)
                .set('Cookie', `token=${authToken}`)
                .send({ title: 'Título actualizado' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/notices/:id', () => {
        it('debería eliminar un aviso', async () => {
            const crearResponse = await request(app)
                .post('/api/notices')
                .set('Cookie', `token=${authToken}`)
                .send(noticeBase);

            const noticeId = crearResponse.body.data.id;

            await request(app)
                .delete(`/api/notices/${noticeId}`)
                .set('Cookie', `token=${authToken}`)
                .expect(200);

            // Verificar que ya no existe
            await request(app)
                .get(`/api/notices/${noticeId}`)
                .set('Cookie', `token=${authToken}`)
                .expect(404);
        });

        it('debería retornar 404 al eliminar un aviso inexistente', async () => {
            const idInexistente = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/notices/${idInexistente}`)
                .set('Cookie', `token=${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });
});