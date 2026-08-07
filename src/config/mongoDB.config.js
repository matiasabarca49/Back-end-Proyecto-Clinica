import mongoose from 'mongoose'
import logger from '../core/logger/logger.js';
import AppError from '../core/exceptions/AppErrors.js';

class MongoManager {
    constructor(url) {
        this.url = url;
    }

    async connect() {
        
        try {
            await mongoose.connect(this.url);

            this.setupListeners();

            logger.info("MongoDB conectado");
        } catch (err) {
            logger.error({
                message: "Error al conectador con  MongoDB",
                error: err.message,
                stack: err.stack
            });

            process.exit(1);
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            logger.info("Desconectado de MongoDB");
        } catch (err) {
            logger.error({
                message: "Error al desconectar MongoDB",
                error: err.message,
                stack: err.stack
            });
        }
    }

    // Configura los listeners para eventos de conexión de MongoDB
    setupListeners() {
        mongoose.connection.on("connected", () => {
            logger.info("Mongo conectado nuevamente");
        });

        mongoose.connection.on("disconnected", () => {
            logger.error("MongoDB se ha desconectado inesperadamente.");
        });

        mongoose.connection.on("error", err => {
            logger.error({
                message: "Error al conectador con  MongoDB",
                error: err.message,
                stack: err.stack
            });
        });
    }
}

//ÚNICA instancia SINGLETON
const mongoManagerInstance = new MongoManager(process.env.DATABASE_URL || "mongodb://localhost:27017/clinica_odontologica");

export default mongoManagerInstance;


