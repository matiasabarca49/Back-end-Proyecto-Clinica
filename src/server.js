import './config/env.config.js'
import { setupSocket } from './config/socket.config.js';
import {closeRedis, getRedisClient} from './config/redis.config.js';
import MongoManager from './config/mongoDB.config.js';
import { initCronJobs } from './core/jobs/cronScheduler.js';
import { createServer } from 'node:http'
import app from './app.js';
//logger
import logger from "./core/logger/logger.js";
//performance
import { performance } from "node:perf_hooks";

const server = createServer(app)

//Workers
import "./core/queues/email.worker.js";


async function startServer() {
    try {
        //Medir el tiempo en que arranca el servidor
        const start = performance.now();

        // Redis
        await getRedisClient();

        //Socket
        setupSocket(server)

        // Cron
        initCronJobs();

        // Mongo
        await MongoManager.connect();

        const portSelected = process.env.PORT || 8080;

        server.listen(portSelected, () => {

            const end = performance.now();

            logger.info(`Servidor corriendo en puerto ${portSelected}`);
            console.log('-'.repeat(60));
            logger.info("[STATUS SERVER] Backend Clínica UP");
            console.log('-'.repeat(60))
            logger.info(`Servidor iniciado correctamente ${(end - start).toFixed(2)} ms`);
            console.log('━'.repeat(60));
        });


    } catch (error) {
        
        await closeRedis();
        await MongoManager.disconnect();
        
        logger.error({
            message: "Error al iniciar el servidor",
            error: err.message,
            stack: err.stack
        });
        console.log('-'.repeat(50))
        logger.error("[STATUS SERVER] Backend Clínica DOWN");
        console.log('-'.repeat(50));

        process.exit(1);
    }
}

startServer();

