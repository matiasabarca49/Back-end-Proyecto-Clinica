/* 
=======================
IOREDIS (para la cola de tareas) se maneja en un archivo separado 'redisQueue.config.js' para mantener la separación de responsabilidades y evitar conflictos con el cliente Redis principal utilizado para caché y sesiones.
=======================
*/
import Redis from "ioredis";
import logger from "../core/logger/logger.js";

export const redisQueue = new Redis({
  host: process.env.HOST_REDIS || "127.0.0.1",
  port: process.env.PORT_REDIS || 6379,
  maxRetriesPerRequest: null
});

// Cierra la conexión de la cola. Sin esto el proceso queda vivo (ej: Jest no termina al correr un solo archivo)
export const closeRedisQueue = async () => {
  if (redisQueue.status === "end") return;
  await redisQueue.quit();
  logger.info("Redis de colas cerrado");
};