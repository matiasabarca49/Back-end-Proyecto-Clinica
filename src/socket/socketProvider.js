import { getIO } from "../config/socket.config.js";

export class SocketProvider {

    emitToDoctor(doctorId, event, data) {
        const io = getIO()
        io.to(`doctor:${doctorId}`)
          .emit(event, data);
    }

    emitToDashBoard(event, data){
        const io = getIO()
        io.to("dashboard")
          .emit(event, data);
    }

    emitToReception(event, data) {
        const io = getIO()
        io.to("reception")
          .emit(event, data);
    }

}

export default new SocketProvider();