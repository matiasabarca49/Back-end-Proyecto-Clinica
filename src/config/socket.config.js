import { Server } from 'socket.io'
import { verifyAccessToken } from '../core/services/jwt.service.js';
import cookie from "cookie";
import { AppError } from '../core/exceptions/index.js';
import logger from '../core/logger/logger.js';

let io;

export const setupSocket = (server) =>{
     io = new Server(server, {
        //Definimos el CORS para permitir conexiones desde cualquier origen
        cors: { origin: process.env.ORIGIN_FRONTEND, credentials: true } 
    });

    //Middleware de conexion
    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies.accessToken;

        const user = await verifyAccessToken(token);

        if (!user) {
            return next(new AppError("TOKEN_EXPIRED"));
        }

        socket.data.user = user;

        next();
    });

    //Se ejecuta cada vez que un cliente realiza una conexión
    io.on('connection', async client => {
        
        const user = client.data.user
        
        logger.info(`Cliente socket conectado: ${user.id}`)
        
        //ingresar en la sala correcta
        if (user.rol === "dashboard") {
            client.join(`dashboard`);
        }

        if (user.rol === "doctor") {
            client.join(`doctor:${user.id}`);
        }
        
        if (user.rol === "employee" || user.rol === "admin") {
            client.join("reception");
        }

        client.on('disconnect', (reason) => {
            logger.info(`Cliente socket desconectado: ${client.data.user.id} | Motivo${reason}`)
        });

    });
    
}

export const getIO = () =>{
    if(!io) throw new AppError("La instancia no existe")

    return io
}