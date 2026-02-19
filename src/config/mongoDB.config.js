import e from 'express';
import mongoose from 'mongoose'

class MongoManager {
    constructor(url) {
        this.url = url;
    }

    async connect() {
        const portSelected = process.env.PORT || "8080";
        
        try {
            await mongoose.connect(this.url);

            this.setupListeners();
            console.log("✅ [OK] Conexión a la DB: ÉXITO");
        } catch (error) {
            throw new Error("No se pudo conectar a la base de datos.");
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log("🛑 [Error] Desconectado de MongoDB");
        } catch (error) {
            console.error("🔴 [Error] Error al desconectar de MongoDB:", error.message);
        }
    }

    // Configura los listeners para eventos de conexión de MongoDB
    setupListeners() {
        mongoose.connection.on("connected", () => {
            console.log("✅ Mongo conectado");
        });

        mongoose.connection.on("disconnected", () => {
            console.error("🔴 [Error] MongoDB se ha desconectado inesperadamente.");
            process.exit(1); // Salir del proceso si MongoDB se desconecta
        });

        mongoose.connection.on("error", err => {
            throw new Error("Error en la conexión de MongoDB: " + err.message);
        });
    }
}



//ÚNICA instancia SINGLETON
const mongoManagerInstance = new MongoManager(process.env.DATABASE_URL || "mongodb://localhost:27017/clinica_odontologica");

export default mongoManagerInstance;


