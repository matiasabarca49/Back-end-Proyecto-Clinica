import mongoose from 'mongoose'

class MongoManager {
    constructor(url) {
        this.url = url;
    }

    async connect() {
        const portSelected = process.env.PORT || "8080";
        
        try {
            await mongoose.connect(this.url);
            console.log("✅ [OK] Conexión a la DB: ÉXITO");
            console.log(`✅ [OK] Servidor corriendo en el puerto ${portSelected} 🚀`);
            console.log('-'.repeat(50))
            console.log("🟢 [STATUS] Servidor Backend Clínica UP");
            console.log('-'.repeat(50));
        } catch (error) {
            console.log("🔴 [Error] Conexión a la DB: FALLÓ");
            console.log(error);
            console.log('-'.repeat(50))
            console.log("🔴 [Error] Servidor Backend Clínica DOWN");
            console.log('-'.repeat(50));
            process.exit(1);
        }
    }
}

//ÚNICA instancia sINGLETON
const mongoManagerInstance = new MongoManager(process.env.DATABASE_URL || "mongodb://localhost:27017/clinica_odontologica");

export default mongoManagerInstance;

