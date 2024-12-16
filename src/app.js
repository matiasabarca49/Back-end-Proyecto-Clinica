import express from 'express';
const app = express();

//Parsear los datos que viene en formato JSON
app.use(express.json());
//recibir datos complejos del navegador
app.use(express.urlencoded({extended: true}));


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

/**
 * ROUTES
*/
//Raiz
app.get("/", (req, res) =>{
    res.send("Backend");
})

import routeUser from './routes/user.router.js';
import routePatient from './routes/patient.router.js';
import routeClinicalHistories from './routes/clinicalHistory.router.js';
import routeDoctor from './routes/doctor.router.js';

app.use("/api/users", routeUser);
app.use("/api/patients", routePatient);
app.use("/api/clinicalHistories", routeClinicalHistories);
app.use("/api/doctors", routeDoctor);

//Docs
import SwaggerJsdoc from 'swagger-jsdoc'
import SwaggerUIExpress from 'swagger-ui-express'
import { swaggerOption } from './config/options.js'
const specs = SwaggerJsdoc(swaggerOption)
app.use('/api/docs', SwaggerUIExpress.serve, SwaggerUIExpress.setup(specs));


app.listen("8080", () => {
    console.log("Servidor Corriendo");
    mongoManager.connect();
})
