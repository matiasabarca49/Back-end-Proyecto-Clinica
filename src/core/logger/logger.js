import winston from "winston";
import fs from "node:fs";
import DailyRotateFile from "winston-daily-rotate-file";
import { getRequestId } from "../request-context/requestContext.js";

const { combine, timestamp, printf, colorize } = winston.format;


// Crear carpeta de logs si no existe
fs.mkdirSync("logs", {
    recursive: true
});


// Iconos para consola
const levelIcons = {
    error: "🔴",
    warn: "🟡",
    info: "🟢",
    debug: "🔵"
};


// Formato para consola
const consoleFormat = combine(
    timestamp({
        format: "HH:mm:ss"
    }),

    printf((info) => {

        const icon = levelIcons[info.level] ?? "";

        const level = info.level
            .toUpperCase()
            .padEnd(5);

        let message = `${icon} ${info.timestamp} ${level} ${info.message}`;

        if (info.method && info.path) {
            message += ` | ${info.method} ${info.path}`;
        }

        if (info.statusCode) {
            message += ` | Status: ${info.statusCode}`;
        }

        if (info.duration) {
            message += ` | ${info.duration}`;
        }

        //Obtenemos el requestID
        const requestId = getRequestId();

        if (requestId) {
            message += ` | requestId: ${requestId}`;
        }

        return message;
    }),

    colorize({
        level: true
    })
);

// Formato para archivos (development)
const developmentFileFormat = combine(
    timestamp(),
    printf((info) => {

        let message = `[${info.timestamp}] ${info.level}: ${info.message}`;

        if (info.method && info.path) {
            message += ` | ${info.method} ${info.path}`;
        }

        if (info.statusCode) {
            message += ` | Status: ${info.statusCode}`;
        }

        if (info.duration) {
            message += ` | ${info.duration}`;
        }

        //Obtenemos el requestID
        const requestId = getRequestId();

        if (requestId) {
            message += ` | requestId: ${requestId}`;
        }  

        if (info.stack) {
            message += `\n${info.stack}`;
        }
        
        return message;
    })
);

const fileFormat = process.env.NODE_ENV === "production" ? winston.format.json() : developmentFileFormat;

//Transporte para la rotacion de archivos
const fileTransportApp = new DailyRotateFile({
    filename: "logs/application-%DATE%.log", //logs por fechas
    datePattern: "YYYY-MM-DD",
    maxSize: "20m", //Tamaño maximo por acrhivo archivo. Se creará otro si se pasa
    maxFiles: "30d", //archivo viejo maximo 30 dias atras
    zippedArchive: true, //Comprime los archivos viejos
    format: fileFormat //Segun el entorno es el formato
});

const errorTransport = new DailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30d",
    zippedArchive: true,
    level: "error",
    format: fileFormat
});

//levels segun entorno. En desarrollo veremos debug y en producción solamente info+
const levels = process.env.NODE_ENV === "production" ? "info" : "debug"


const logger = winston.createLogger({

    
    level: levels,

    transports: [

        // Consola
        new winston.transports.Console({
            format: consoleFormat
        }),


        // Todos los logs app
        fileTransportApp,


        // Solo errores
        errorTransport

    ]

});


export default logger;