/* 
=======================
IOREDIS (para la cola de tareas) se maneja en un archivo separado 'redisQueue.config.js' para mantener la separación de responsabilidades y evitar conflictos con el cliente Redis principal utilizado para caché y sesiones.
=======================
*/
import Redis from "ioredis";

export const redisQueue = new Redis({
  host: process.env.HOST_REDIS || "127.0.0.1",
  port: process.env.PORT_REDIS || 6379,
  maxRetriesPerRequest: null
});