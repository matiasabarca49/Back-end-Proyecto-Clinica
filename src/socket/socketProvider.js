import { getIO } from "../config/socket.config";

export class SocketProvider {

    emitToDoctor(doctorId, event, data) {
        const io = getIO()
        io.to(`doctor:${doctorId}`)
          .emit(event, data);
    }


    emitToReception(event, data) {
        const io = getIO()
        io.to("reception")
          .emit(event, data);
    }

}

export default new SocketProvider();