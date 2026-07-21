import { Server } from 'socket.io'
import { verifyAccessToken } from '../service/auth/jwt.service.js';
import cookie from "cookie";
import { AppError } from '../exceptions/index.js';

let io;

export const setupSocket = (server) =>{
     io = new Server(server, {
        //Definimos el CORS para permitir conexiones desde cualquier origen
        cors: { origin: "http://127.0.0.1:5500", credentials: true } 
    });

    //Se ejecuta cada vez que un cliente realiza una conexión
    io.on('connection', async client => {
        console.log("Cliente conectado: ", client.id)
        
        //Obtener las cookies y parsearla
        const cookies = cookie.parse(client.handshake.headers.cookie || "");
        const token = cookies.accessToken;
        
        const user = await verifyAccessToken(token)
        
        if (!user) {
           client.disconnect();
           console.log("conexion de usuario inexistente")
           return;
        }

        //Obtener ID del JWT
        console.log("Usuario para evento: ", user)

        //Meterlo en la sala correcta

        if (user.rol === "doctor") {
            client.join(`doctor:${user.id}`);
        }

        if (user.rol === "employee") {
            client.join("reception");
        }

        console.log("Usuario conectado:", user.id);

        //Crear la Room
        client.on('disconnect', (client) => {
        console.log("Cliente desconectado: ", client.id)
    });
    });
    
}

export const getIO = () =>{
    if(!io) throw new AppError("La instancia no existe")

    return io
}