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

/**
 * Ejecuta un bloque de operaciones como una sola transacción: se guardan todas o ninguna.
 * Cada operación dentro de fn debe recibir { session }; si no, queda fuera de la transacción.
 * Si fn lanza un error, se descarta todo y el error se relanza.
 * Ante un error transitorio de Mongo (ej: conflicto de escritura) se reintenta fn completa,
 * por eso adentro solo van operaciones de la base: emails, sockets y cache van después.
 * @param {(session: mongoose.ClientSession) => Promise<any>} fn Operaciones a ejecutar
 * @returns {Promise<any>} Lo que devuelva fn
 */
export const withTransaction = async (fn) => {
    const session = await mongoose.startSession();
    try {
        return await session.withTransaction(() => fn(session));
    } finally {
        await session.endSession();
    }
};

//ÚNICA instancia SINGLETON
const mongoManagerInstance = new MongoManager(process.env.DATABASE_URL || "mongodb://localhost:27017/clinica_odontologica");

export default mongoManagerInstance;


