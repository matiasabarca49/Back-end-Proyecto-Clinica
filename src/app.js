import express from 'express';
const app = express();

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


//Inicio y Conexion DB
import MongoManager from './DAO/mongo/db.js';
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
import routeClinicalHistories from './routes/clinicalHistory.router.js';
import routeDoctor from './routes/doctor.router.js';
import routeAppointments from './routes/appointment.router.js';
import routeSession from './routes/session.router.js';
import routeFailure from './routes/failure.router.js';
import routeTreatments from './routes/treatments.router.js';
app.use("/api/users", routeUser);
app.use("/api/patients", routePatient);
app.use("/api/clinicalHistories", routeClinicalHistories);
app.use("/api/doctors", routeDoctor);
app.use("/api/appointments", routeAppointments);
app.use("/api/sessions", routeSession);
app.use("/api/fails", routeFailure);
app.use("/api/treatments", routeTreatments)
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

app.listen("8080", () => {
    console.log("Servidor Corriendo");
    mongoManager.connect();
})
