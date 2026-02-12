import 'dotenv/config';
import app, { googleAuth } from './app.js';
import MongoManager from './config/mongoDB.config.js';

const portSelected = process.env.PORT || "8080";

app.listen(portSelected, () => {
    //Info de configuración email
    if(process.env.EMAIL_USER && process.env.EMAIL_PASS){
        console.log("✅ [OK] Envio de Emails Activado.");
    }else{
        console.log("⚠️ [Info] Configuración de email NO encontrada - Emails no se enviarán")
    }
    
    //Info de configuración Google Auth
    setTimeout(async ()=>{
        if(googleAuth){
            console.log("✅ [OK] Autenticacion con Google Activada -")
        }else{
            console.log("⚠️ [Info] Autenticacion con Google NO Activada -")
        }
        
        //Conectar a la base de datos
        console.log(`Conectando a la base de datos de MongoDB...`);
        await MongoManager.connect()
        console.timeEnd("Servidor levantado en");
        console.log('━'.repeat(50));
    }, 1000)
})