
/* 
    * Archivo: redis.config.js
    * Descripción: Configuración y manejo de la conexión a Redis.
    * 
    * Características:
    * Se implementa un patrón singleton para asegurar que solo haya una instancia del cliente Redis en toda la aplicación.
    * Se manejan eventos de error para detectar problemas de conexión y se implementa una función para cerrar la conexión de manera segura.
*/

import { createClient } from 'redis';
import logger from '../core/logger/logger.js';

// Variable global para almacenar la única instancia del cliente.
let redisClientInstance = null; 

/**
 * Función asíncrona que conecta a Redis o devuelve la instancia existente.
 * @returns {Promise<object>} El cliente Redis conectado.
 */
export async function getRedisClient() {
    // 1. Verificar si la instancia ya existe
    if (redisClientInstance && redisClientInstance.isOpen) {
        return redisClientInstance;
    }

    //Usamos la función importada 'createClient'
    const client = createClient({
        socket: {
            host: process.env.HOST_REDIS || '127.0.0.1',
            port: process.env.PORT_REDIS || 6379,
            connectTimeout: 5000
        }
    });

    client.on('error', (err) => {
        logger.error({
            message: "Error en el cliente Redis",
            error: err.message,
            stack: err.stack
        });
    });

    client.on("reconnecting", () => {
        logger.warn("Reconectando Redis...");
    });

    client.on("ready", () => {
        logger.info("Redis conectado");
    });

    try {
        await client.connect();
        redisClientInstance = client; // Almacena la instancia conectada
        return redisClientInstance;

    } catch (error) {
        logger.error({
            message: "No se puedo conectar a Redis",
            error: err.message,
            stack: err.stack
        });
        await closeRedis(); // Cierra la conexión si hay un error
        
        process.exit(1);
    }
}

export const closeRedis = async () => {
  if (redisClientInstance) {
    await redisClientInstance.quit();
    redisClientInstance = null;
    logger.info("Redis cerrado");
  }
  else{
    logger.error("No hay una instancia de Redis para cerrar.");
  }
};



