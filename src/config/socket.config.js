import { Server } from 'socket.io'
import { verifyAccessToken } from '../service/auth/jwt.service';
import cookie from "cookie";
import { AppError } from '../exceptions';

let io;

const setupSocket = (server) =>{
     io = new Server(server, {
        //Definimos el CORS para permitir conexiones desde cualquier origen
        cors: { origin: "*" } 
    });

    //Se ejecuta cada vez que un cliente realiza una conexión
    io.on('connection', async client => {
        console.log(client.id)
        //Obtener ID del JWT

        //Obtener las cookies y parsearla
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies.accessToken;

        const user = verifyAccessToken(token)

        console.log("Usuario para evento: ", user)

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