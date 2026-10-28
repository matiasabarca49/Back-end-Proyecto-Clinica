import request from 'supertest';
import app from '../../../src/app.js';
import { User } from '../../../src/modules/user/user.model.js';
import { Doctor } from '../../../src/modules/doctor/doctor.model.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser } from '../../../__test__/helpers.tests.js';

let accessToken;

beforeEach(async () => {
  await clearDB();
  const admin = await createAdminUser();
  accessToken = createAdminToken(admin);
  await createAdminSession(admin);
});

const api = {
  post: (url) => request(app).post(url).set('Cookie', `accessToken=${accessToken}`),
  put: (url) => request(app).put(url).set('Cookie', `accessToken=${accessToken}`),
  delete: (url) => request(app).delete(url).set('Cookie', `accessToken=${accessToken}`),
};

// Datos ficticios de un doctor completo para el alta
const doctorData = (overrides = {}) => ({
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
  ...overrides,
});

describe('PUT /api/users/:id', () => {

  it('no permite escribir campos protegidos y no devuelve el hash de la contraseña', async () => {
    const target = await User.create({
      name: 'Ana',
      lastName: 'Gomez',
      email: 'ana.gomez@test.com',
      password: 'HASH-ORIGINAL',
      rol: 'employee',
      status: 'active',
      mustChangePassword: true,
      passwordHistory: ['HASH-ORIGINAL'],
    });

    const response = await api.put(`/api/users/${target._id}`)
      .send({
        name: 'Ana Maria',
        password: 'texto-plano',
        status: 'inactive',
        passwordHistory: [],
        mustChangePassword: false,
        rol: 'EMPLOYEE',
      })
      .expect(200);

    expect(response.body.data).not.toHaveProperty('password');
    expect(response.body.data).not.toHaveProperty('passwordHistory');

    const saved = await User.findById(target._id).lean();
    expect(saved.name).toBe('Ana maria'); // el campo permitido sí se actualizó
    expect(saved.password).toBe('HASH-ORIGINAL');
    expect(saved.passwordHistory).toEqual(['HASH-ORIGINAL']);
    expect(saved.status).toBe('active');
    expect(saved.mustChangePassword).toBe(true);
    expect(saved.rol).toBe('employee');
  });

  it('al editar un doctor sincroniza la cuenta y la ficha profesional', async () => {
    const { body } = await api.post('/api/users').send(doctorData()).expect(201);
    const id = body.data.id;

    await api.put(`/api/users/${id}`)
      .send({ name: 'Juan Carlos', email: 'jc.perez@test.com', phone: '2619999999' })
      .expect(200);

    const user = await User.findById(id).lean();
    const doctor = await Doctor.findById(id).lean();
    expect(user.email).toBe('jc.perez@test.com');
    expect(doctor.email).toBe('jc.perez@test.com');
    expect(doctor.name).toBe(user.name);
    expect(doctor.phone).toBe('2619999999');
  });

  it('si el email ya existe responde 409 y la ficha del doctor vuelve a sus valores', async () => {
    await User.create({ name: 'Otro', lastName: 'Usuario', email: 'ocupado@test.com', password: 'x', rol: 'employee' });
    const { body } = await api.post('/api/users').send(doctorData()).expect(201);
    const id = body.data.id;

    await api.put(`/api/users/${id}`)
      .send({ phone: '2615555555', email: 'ocupado@test.com' })
      .expect(409);

    const user = await User.findById(id).lean();
    const doctor = await Doctor.findById(id).lean();
    expect(user.email).toBe('juan.perez@test.com');
    expect(doctor.phone).toBe('2610000000');
  });
});

describe('POST /api/users', () => {

  it('si la ficha del doctor falla por DNI repetido, no deja el usuario creado', async () => {
    await api.post('/api/users').send(doctorData()).expect(201);

    await api.post('/api/users')
      .send(doctorData({ email: 'otro.doctor@test.com', professionalLicense: 'MP-2000' })) // mismo DNI
      .expect(409);

    expect(await User.findOne({ email: 'otro.doctor@test.com' })).toBeNull();
  });

  it('a un usuario que no es doctor no le valida ni guarda los campos de doctor', async () => {
    await api.post('/api/users')
      .send({
        name: 'Laura',
        lastName: 'Diaz',
        email: 'laura.diaz@test.com',
        password: 'Segura123!',
        rol: 'employee',
        dni: 123,
        color: 'rojo',
        frequency: 'x',
        schedules: 'x',
      })
      .expect(201);

    const user = await User.findOne({ email: 'laura.diaz@test.com' }).lean();
    expect(await Doctor.findById(user._id)).toBeNull();
  });
});

describe('DELETE /api/users/:id', () => {

  it('al dar de baja un usuario doctor también se da de baja su ficha, sin borrarlos', async () => {
    const { body } = await api.post('/api/users').send(doctorData()).expect(201);
    const id = body.data.id;

    await api.delete(`/api/users/${id}`).expect(200);

    expect((await User.findById(id).lean()).active).toBe(false);
    expect((await Doctor.findById(id).lean()).active).toBe(false);

    // Para la API ya no existen: ni se leen, ni se edita la ficha, ni se vuelven a dar de baja
    await request(app).get(`/api/users/${id}`).set('Cookie', `accessToken=${accessToken}`).expect(404);
    await request(app).get(`/api/doctors/${id}`).set('Cookie', `accessToken=${accessToken}`).expect(404);
    await api.put(`/api/doctors/${id}`).send({ phone: '2619999999' }).expect(404);
    await api.delete(`/api/users/${id}`).expect(404);
  });

  it('da de baja a un usuario con sesión activa y le cierra la sesión', async () => {
    const { body } = await api.post('/api/users').send({
      name: 'Laura', lastName: 'Diaz', email: 'laura.diaz@test.com', password: 'Segura123!', rol: 'employee',
    }).expect(201);
    const employee = { _id: body.data.id, email: 'laura.diaz@test.com', rol: 'employee' };
    const employeeToken = createAdminToken(employee);
    await createAdminSession(employee);
    const asEmployee = () => request(app).get('/api/patients').set('Cookie', `accessToken=${employeeToken}`);

    await asEmployee().expect(200);

    await api.delete(`/api/users/${employee._id}`).expect(200);

    // Mismo token, todavía sin vencer: sin la sesión en Redis ya no pasa authToken
    await asEmployee().expect(401);
  });

  it('un usuario dado de baja no puede renovar la sesión con su refresh token', async () => {
    // Login real: deja en Redis la sesión y el refresh token
    await api.post('/api/users').send({
      name: 'Laura', lastName: 'Diaz', email: 'laura.diaz@test.com', password: 'Segura123!', rol: 'employee',
    }).expect(201);
    const login = await request(app).post('/api/sessions/login')
      .send({ email: 'laura.diaz@test.com', password: 'Segura123!' }).expect(200);
    const cookies = login.headers['set-cookie'];
    const refresh = () => request(app).post('/api/sessions/refresh-token').set('Cookie', cookies);

    await api.delete(`/api/users/${login.body.data.id}`).expect(200);

    const res = await refresh().expect(403);
    expect(res.body.error.message).toBe('El usuario fue dado de baja');
  });

  it('los listados de usuarios y doctores no devuelven a los dados de baja', async () => {
    const baja = (await api.post('/api/users').send(doctorData()).expect(201)).body.data.id;
    const activo = (await api.post('/api/users').send(doctorData({
      email: 'ana.ruiz@test.com', dni: '30999888', professionalLicense: 'MP-2000',
    })).expect(201)).body.data.id;

    await api.delete(`/api/users/${baja}`).expect(200);

    const get = async (url) => (await request(app).get(url).set('Cookie', `accessToken=${accessToken}`).expect(200)).body.data;
    const ids = (list) => list.map(item => item.id);

    // Usuarios: completo, paginado y por rol
    expect(ids(await get('/api/users'))).not.toContain(baja);
    expect(ids(await get('/api/users'))).toContain(activo);
    expect(ids((await get('/api/users?page=1')).docs)).not.toContain(baja);
    expect(ids(await get('/api/users/filter?rol=doctor'))).toEqual([activo]);

    // Doctores: completo, paginado y horarios del calendario
    expect(ids(await get('/api/doctors'))).toEqual([activo]);
    expect(ids((await get('/api/doctors?page=1')).docs)).toEqual([activo]);
    expect(ids(await get('/api/doctors/schedules'))).toEqual([activo]);
  });

  it('si falla la baja de la ficha, el usuario no se da de baja', async () => {
    const { body } = await api.post('/api/users').send(doctorData()).expect(201);
    const id = body.data.id;
    // Sin ficha, la baja de la ficha falla después de haber dado de baja al usuario dentro de la transacción
    await Doctor.deleteOne({ _id: id });

    await api.delete(`/api/users/${id}`).expect(404);

    expect((await User.findById(id).lean()).active).toBe(true);
  });
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
    it('da de baja al usuario sin borrarlo', async () => {
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

      // Sigue en la base, pero inactivo
      expect((await User.findById(usuarioId).lean()).active).toBe(false);

      // Un usuario dado de baja no se edita (sin ficha de doctor, el 404 lo da el propio usuario)
      await api.put(`/api/users/${usuarioId}`).send({ name: 'Otro' }).expect(404);
    });
  });

});
