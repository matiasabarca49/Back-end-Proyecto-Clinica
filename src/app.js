import express from 'express';

console.time("Servidor levantado en");

const app = express();
//variables de entorno
import 'dotenv/config'
//Parsear los datos que viene en formato JSON
app.use(express.json());
//recibir datos complejos del navegador
app.use(express.urlencoded({extended: true}));
//Obtener la ruta actual
import path from 'path';
import { fileURLToPath } from 'url';
// Obtener el __dirname equivalente en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//Archivos estaticos
app.use(express.static(__dirname + '/public'))
//passport google 
import passport from 'passport';
import "./config/passport.config.js";
app.use(passport.initialize());

//Inicio y Conexion DB
import MongoManager from './config/dbMongoDB.js';
const mongoManager = new MongoManager("mongodb://localhost:27017/clinica_odontologica");


//Cors
import cors from 'cors'
app.use(cors({
    optionsSuccessStatus: 200,
    credentials: true,
    origin: "http://localhost:5173"
}))

//Utilizacion de Cookies
import cookieParser from 'cookie-parser';
app.use(cookieParser())


/**
 * ROUTES
*/
//Raiz


app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, './public/html/index.html'));
    // res.send("Backend");
})

import routeUser from './routes/user.router.js';
import routePatient from './routes/patient.router.js';
import routeDoctor from './routes/doctor.router.js';
import routeAppointments from './routes/appointment.router.js';
import routeSession from './routes/session.router.js';
import routeFailure from './routes/failure.router.js';
import routeTreatments from './routes/treatments.router.js';
import routeNotices from './routes/notice.router.js';
app.use("/api/users", routeUser);
app.use("/api/patients", routePatient);
app.use("/api/doctors", routeDoctor);
app.use("/api/appointments", routeAppointments);
app.use("/api/sessions", routeSession);
app.use("/api/fails", routeFailure);
app.use("/api/treatments", routeTreatments);
app.use("/api/notices", routeNotices);

//Autenticación Google
import routeAuth from './routes/passports/google.passport.router.js';
let googleAuth = false;
if(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CALLBACK_URL){
    app.use("/api/auth",routeAuth);
    googleAuth = true;
}

//Docs
import SwaggerJsdoc from 'swagger-jsdoc'
import SwaggerUIExpress from 'swagger-ui-express'
import { swaggerOption } from './config/options.js'
const specs = SwaggerJsdoc(swaggerOption)
app.use('/api/docs', SwaggerUIExpress.serve, SwaggerUIExpress.setup(specs));


//Rutas que no existen. Mostrar 404 No encontrado
app.use("*", (req, res) =>{
    res.status(404).send({status:"Error", reason: "Error 404 NotFound"})
});

const portSelected = process.env.PORT || "8080";

app.listen(portSelected, () => {
    mongoManager.connect()
    console.log("==========================================");
    console.log("🟢 [STATUS] Servidor Backend Clínica UP");
    console.log("==========================================");
    console.log(`✅ [OK] Servidor corriendo en el puerto ${portSelected} 🚀`);

    setTimeout(()=>{
        if(googleAuth){
            console.log("✅ [OK] Autenticacion con Google Activada -")
        }else{
            console.log("⚠️ [Info] Autenticacion con Google NO Activada -")
        }
        console.timeEnd("Servidor levantado en");
        console.log("==========================================")
    }, 1000)
})