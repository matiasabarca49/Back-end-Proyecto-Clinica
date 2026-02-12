import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; //
import { User } from '../src/model/mongo/user.model'; 

let mongoServer;

// Se ejecuta ANTES de todos los tests
export const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create();//Crea BD en MEMORIA
  const uri = mongoServer.getUri();// URI temporal
  await mongoose.connect(uri);// Conecta a la DB Temporal
  console.log('✅ MongoDB en memoria conectada para tests');
};

// Se ejecuta DESPUÉS de todos los tests
export const disconnectDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();

  console.log('✅ MongoDB en memoria desconectada');
};

// Limpia colecciones entre tests
export const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

//Crear usuario admin para tests
export const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const adminUser = await User.create({
    email: 'admin@test.com',
    password: hashedPassword,
    rol: 'admin',
    name: 'Admin',
    lastName: 'Test',
    status: 'active',
    lastLogintAt: null,
    mustChangePassword: true,
    passwordChangedAt: null,
    passwordHistory: [],
  });

  return adminUser;
};

//Helper para hacer login y obtener token
export const getAdminToken = async (app) => {
  const request = (await import('supertest')).default;
  
  const response = await request(app)
    .post('/api/sessions/login')
    .send({
      email: 'admin@test.com',
      password: 'Admin123!'
    });

  // Si tu API retorna el token en el body
  if (response.body.token) {
    return response.body.userData.token;
  }
  
  // Si tu API retorna el token en una cookie (Set-Cookie header)
  const cookies = response.headers['set-cookie'];
  if (cookies) {
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
    if (tokenCookie) {
      // Extraer el valor del token de "token=abc123; Path=/; HttpOnly"
      const token = tokenCookie.split(';')[0].split('=')[1];
      return token;
    }
  }
  
  throw new Error('No se pudo obtener el token de autenticación');
};