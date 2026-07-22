import './config/env.config.js'
import { setupSocket } from './config/socket.config.js';
import {closeRedis, getRedisClient} from './config/redis.config.js';
import MongoManager from './config/mongoDB.config.js';
import { initCronJobs } from './jobs/cronScheduler.js';
import { createServer } from 'node:http'
import app from './app.js';

const server = createServer(app)

//Workers
import "./workers/email.worker.js";


async function startServer() {
    try {
        // Redis
        await getRedisClient();

        //Socket
        setupSocket(server)

        // Cron
        initCronJobs();

        // Mongo
        console.log("━ Conectando a MongoDB...");
        await MongoManager.connect();

        const portSelected = process.env.PORT || 8080;

        server.listen(portSelected, () => {
            console.log(`✅ Servidor corriendo en puerto ${portSelected}`);
            console.log('-'.repeat(50));
            console.log("🟢 [STATUS] Servidor Backend Clínica UP");
            console.log('-'.repeat(50))
            console.timeEnd("Servidor levantado en");
            console.log('━'.repeat(50));
        });


    } catch (error) {
        
        await closeRedis();
        await MongoManager.disconnect();
        
        console.error("🔴 [Error] Error al iniciar el servidor:", error.message);
        console.log('-'.repeat(50))
        console.log("🔴 [Error] Servidor Backend Clínica DOWN");
        console.log('-'.repeat(50));

        process.exit(1);
    }
}

startServer();

