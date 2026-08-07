import winston from "winston";
import fs from "node:fs";

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

        return message;
    }),

    colorize({
        level: true
    })
);


// Formato para archivos (producción)
const fileFormat = combine(
    timestamp(),
    printf((info) => {

        let message = `[${info.timestamp}] ${info.level}: ${info.message}`;

        if (info.method && info.path) {
            message += ` | ${info.method} ${info.path}`;
        }

        if (info.statusCode) {
            message += ` | Status: ${info.statusCode}`;
        }

        if (info.stack) {
            message += `\n${info.stack}`;
        }

        return message;
    })
);


const logger = winston.createLogger({

    // En desarrollo veremos debug,
    // en producción solamente info+
    level: process.env.NODE_ENV === "production"
        ? "info"
        : "debug",

    transports: [

        // Consola
        new winston.transports.Console({
            format: consoleFormat
        }),


        // Todos los logs
        new winston.transports.File({
            filename: "logs/app.log",
            format: fileFormat
        }),


        // Solo errores
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: fileFormat
        })

    ]

});


export default logger;