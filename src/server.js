import 'dotenv/config';
import './utils/dotenv.helper.js';
import app from './app.js';
import MongoManager from './config/mongoDB.config.js';
import {closeRedis, getRedisClient} from './config/redis.config.js';
import { initCronJobs } from './jobs/cronScheduler.js';

//Workers
import "./workers/email.worker.js";

async function startServer() {
    try {
        // Redis
        await getRedisClient();

        // Cron
        initCronJobs();

        // Mongo
        console.log("━ Conectando a MongoDB...");
        await MongoManager.connect();

        const portSelected = process.env.PORT || 8080;

        app.listen(portSelected, () => {
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

