import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; //
import { User } from '../src/model/mongo/user.model'; 
import jwt from 'jsonwebtoken';
import { getRedisClient } from '../src/config/redis.config';

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
  await mongoose.disconnect();
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

export const createAdminToken = (user) => {
  console.log('Creando token para usuario:', user.email);
  const secretKey = process.env.SECRET_SESSIONS
  console.log('Usando secretKey:', secretKey);
  return jwt.sign(
    {id: user._id,
      email: user.email,
      rol: user.rol
    },
    process.env.SECRET_SESSIONS,
    {expiresIn: '1h'}
  )
}

export const createAdminSession = async (user) => {
  const redisClient = await getRedisClient();
  await redisClient.set(`session:${user._id}`, 'active', 'EX', 3600); // Sesión activa por 1 hora
};
