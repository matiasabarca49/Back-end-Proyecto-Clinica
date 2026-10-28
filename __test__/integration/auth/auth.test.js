import request from 'supertest';
import app from '../../../src/app.js';
import { User } from '../../../src/modules/user/user.model.js';
import { isValidPassword } from '../../../src/utils/utils.js';
import { UsersService } from '../../../src/modules/user/index.js';
import AuthService from '../../../src/modules/auth/auth.service.js';
import { clearDB, createAdminSession, createAdminToken, createAdminUser } from '../../../__test__/helpers.tests.js';

describe('PATCH /api/sessions/change-password', () => {

  beforeEach(async () => {
    await clearDB();
  });

  it('cambia la contraseña sin devolver el hash ni el historial', async () => {
    // createAdminUser crea el usuario con la contraseña 'Admin123!' y el historial vacío
    const admin = await createAdminUser();
    const accessToken = createAdminToken(admin);
    await createAdminSession(admin);

    const response = await request(app)
      .patch('/api/sessions/change-password')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({ currentPassword: 'Admin123!', newPassword: 'NuevaClave123!' })
      .expect(200);

    expect(response.body.data).not.toHaveProperty('password');
    expect(response.body.data).not.toHaveProperty('passwordHistory');

    const saved = await User.findById(admin._id).lean();
    expect(isValidPassword(saved.password, 'NuevaClave123!')).toBe(true);
    expect(saved.passwordHistory).toHaveLength(1);
    expect(saved.mustChangePassword).toBe(false);
  });
});


describe('Login de un usuario dado de baja', () => {

  beforeEach(async () => {
    await clearDB();
  });

  it('no inicia sesión con email y contraseña, y con contraseña incorrecta no revela que fue dado de baja', async () => {
    // createAdminUser crea el usuario con la contraseña 'Admin123!'
    const admin = await createAdminUser();
    const login = (password) => request(app).post('/api/sessions/login').send({ email: 'admin@test.com', password });

    await login('Admin123!').expect(200);

    await User.updateOne({ _id: admin._id }, { active: false });
    const res = await login('Admin123!').expect(403);
    expect(res.body.error.message).toBe('El usuario fue dado de baja');
    await login('Incorrecta123!').expect(401);
  });

  it('no envía el código de verificación del login con 2FA', async () => {
    const admin = await createAdminUser();
    await User.updateOne({ _id: admin._id }, { active: false });

    const res = await request(app).post('/api/sessions/login-2fa').send({ email: 'admin@test.com' }).expect(403);
    expect(res.body.error.message).toBe('El usuario fue dado de baja');
  });

  it('no inicia sesión con Google, y un usuario activo sí', async () => {
    const admin = await createAdminUser();
    // Mismo camino que passport: busca por email y le pasa ese usuario a loginGoogle
    const googleLogin = async () => new AuthService().loginGoogle(await new UsersService().findUserByEmail('admin@test.com'));

    await expect(googleLogin()).resolves.toHaveProperty('accessToken');

    await User.updateOne({ _id: admin._id }, { active: false });
    await expect(googleLogin()).rejects.toThrow('El usuario fue dado de baja');
  });
});
