
/* 
    * Archivo: redis.config.js
    * Descripción: Configuración y manejo de la conexión a Redis.
    * 
    * Características:
    * Se implementa un patrón singleton para asegurar que solo haya una instancia del cliente Redis en toda la aplicación.
    * Se manejan eventos de error para detectar problemas de conexión y se implementa una función para cerrar la conexión de manera segura.
*/

import { createClient } from 'redis';

// Variable global para almacenar la única instancia del cliente.
let redisClientInstance = null; 

/**
 * Función asíncrona que conecta a Redis o devuelve la instancia existente.
 * @returns {Promise<object>} El cliente Redis conectado.
 */
export async function getRedisClient() {
    // 1. Verificar si la instancia ya existe
    if (redisClientInstance && redisClientInstance.isOpen) {
       /*  console.log('✅ Usando la instancia existente de Redis.'); */
        return redisClientInstance;
    }

    //Si no existe, crear una nueva instancia y conectar
    console.log('⏳ Creando y conectando una nueva instancia de Redis...');

    //Usamos la función importada 'createClient'
    const client = createClient({
        socket: {
            host: process.env.HOST_REDIS || '127.0.0.1',
            port: process.env.PORT_REDIS || 6379,
            connectTimeout: 5000
        }
    });

    client.on('error', async (err) => {
        console.error("🔴 [Error] Error en el Cliente Redis: " + err.message);

        await closeRedis(); // Cierra la conexión si hay un error
        
        process.exit(1); // Salir del proceso con código de error
    });

    try {
        await client.connect();
        redisClientInstance = client; // Almacena la instancia conectada
        console.log('✅ [OK] Conexión a Redis establecida.');
        return redisClientInstance;

    } catch (error) {
        console.error('🔴 [Error] No se pudo conectar a Redis:');
        throw new Error("Falló al conectar el cliente Redis");
    }
}

export const closeRedis = async () => {
  if (redisClientInstance) {
    await redisClientInstance.quit();
    redisClientInstance = null;
    console.log("🛑 [info] Redis cerrado");
  }
  else{
    console.log("⚠️ [info] No hay una instancia de Redis para cerrar.");
  }
};



