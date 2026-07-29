import { Server } from 'socket.io'
import { verifyAccessToken } from '../service/auth/jwt.service.js';
import cookie from "cookie";
import { AppError } from '../exceptions/index.js';

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

        console.log("Usuario conectado para eventos: ", user)

        socket.data.user = user;

        next();
    });

    //Se ejecuta cada vez que un cliente realiza una conexión
    io.on('connection', async client => {
        //console.log("Cliente conectado: ", client.id)

        const user = client.data.user

        
        //ingresar en la sala correcta
        if (user.rol === "dashboard") {
            client.join(`dashboard`);
            console.log(`${user.email} ingreso a la sala dashboard`)
        }

        if (user.rol === "doctor") {
            client.join(`doctor:${user.id}`);
            console.log(`${user.email} ingreso a la sala doctor`)
        }
        
        if (user.rol === "employee" || user.rol === "admin") {
            client.join("reception");
            console.log(`${user.email} ingreso a la sala recepcion`)
        }

        client.on('disconnect', (reason) => {
            console.log("Cliente desconectado: ", client.id)
            console.log("Motivo:", reason);
        });

    });
    
}

export const getIO = () =>{
    if(!io) throw new AppError("La instancia no existe")

    return io
}