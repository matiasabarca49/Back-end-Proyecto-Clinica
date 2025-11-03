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

    client.on('error', (err) => {
        console.error('🔴 [Error] En el Cliente Redis:', err.message)
        process.exit(1); // Salir si hay un error crítico
    });

    try {
        await client.connect();
        redisClientInstance = client; // Almacena la instancia conectada
        console.log('✅ [OK] Conexión a Redis establecida.');
        return redisClientInstance;

    } catch (error) {
        console.error('🔴 [Error] Falló al conectar el cliente Redis.', error.message);
        throw new Error("No se pudo iniciar el Singleton de Redis.");
    }
}



/* import { createClient } from 'redis';

//Configuración y conexión a Redis
const redisClient = createClient({
  url: 'redis://localhost:6379',
  disableOfflineQueue: false
});

//Conexión y manejo de errores
redisClient.on('error', (err) => console.error('Redis error:', err));


try {
    // El método .connect() retorna una Promise. 
    // Si es exitoso, la ejecución continúa. Si falla, va al bloque catch.
    await redisClient.connect();
    
    console.log('✅ [OK] Conexión a Redis exitosa.');
    
    // Opcional: Ejecutar un comando simple para confirmar
    const pong = await redisClient.ping();
    console.log(`✅ [OK]Ping de Redis exitoso: ${pong}`);

} catch (err) {
    console.error('🔴 [Error] No se pudo conectar a Redis. Cerrando aplicación.');
    // Cierra el proceso si no se pudo conectar a la dependencia crítica
    process.exit(1);
}


export default redisClient; */
