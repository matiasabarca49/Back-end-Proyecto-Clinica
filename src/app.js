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

//passport google 
import passport from 'passport';
import "./config/passport.config.js";
app.use(passport.initialize());

//Cors
import cors from 'cors'
app.use(cors({
    optionsSuccessStatus: 200,
    credentials: true,
    origin: process.env.ORIGIN_FRONTEND || "http://localhost:5173"
}))

//Utilizacion de Cookies
import cookieParser from 'cookie-parser';
app.use(cookieParser())

//Confiar en el proxy (si se despliega detrás de uno)
app.set('trust proxy', 1);

//Limitar el número de peticiones a la API
import { generalLimit } from './middlewares/rateLimit.middleware.js';
app.use(generalLimit);

//Metricas
app.use(metricsMiddleware);

//Logger de Rutas
import httpLogger from "./middlewares/httpLogger.middleware.js";
app.use(httpLogger);


/**
 * ROUTES
*/
//rutas datos
import routeUser from './modules/user/user.router.js';
import routePatient from './modules/patient/patient.router.js';
import routeDoctor from './modules/doctor/doctor.router.js';
import routeAppointments from './modules/appointment/appointment.router.js';
import routeAuth from './modules/auth/auth.router.js';
import routeNotices from './modules/notice/notice.router.js';
//Manejo de errores y excepciones
import { errorHandler, notFoundHandler } from './middlewares/errors.middleware.js';
//Autenticación Google
import { validateEnvVars } from './utils/dotenv.helper.js';
import routeAuthGoogle from './modules/auth/passports/google.auth.router.js';
//Health check
import healthRouter from './modules/health/health.router.js';
//metrics
import metricsRouter from './modules/metrics/metrics.router.js'


//Raiz
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, './public/html/index.html'));
    // res.send("Backend");
})

app.use("/api/users", routeUser);
app.use("/api/patients", routePatient);
app.use("/api/doctors", routeDoctor);
app.use("/api/appointments", routeAppointments);
app.use("/api/sessions", routeAuth);
app.use("/api/notices", routeNotices);

//Autenticación Google
let googleAuth = false;
if(validateEnvVars("google")){
    app.use("/api/auth", routeAuthGoogle);
    googleAuth = true;
}

//health check
app.use("/api/health", healthRouter);

//metrics
app.use("/api/metrics", metricsRouter);


//Docs
//Documentación Swagger
import SwaggerJsdoc from 'swagger-jsdoc'
import SwaggerUIExpress from 'swagger-ui-express'
import { swaggerOption, swaggerOpts } from './config/swagger.config.js'
import { metricsMiddleware } from './middlewares/metrics.middleware.js';
const specs = SwaggerJsdoc(swaggerOption)
app.use('/api/docs', SwaggerUIExpress.serve, SwaggerUIExpress.setup(specs, swaggerOpts));

//Manejo de Excepciones
app.use(notFoundHandler);  // Maneja 404
app.use(errorHandler);     // Maneja todos los errores

export {googleAuth};

export default app;
