import { AppointmentDTO } from "../../dto/appointment.dto.js";
import socketProvider  from "../../socket/socketProvider.js";

class NotificationService {

    constructor(){
        this.socketProvider = socketProvider
    }

    /**
     * 
     * Método para notificar a un doctor que el paciente llegó
     * 
     * Emite el evento mediate socket
     * 
     * @param {Object} appointment 
     */
    async notifyPatientWaiting(appointment) {

        try{
            console.log("Notificando a doctor")
            this.socketProvider.emitToDoctor(
                appointment.doctorId,
                "appointment.waiting",
                AppointmentDTO.toShortResponse(appointment)
            );

            console.log("Notificando a recepción")
            this.socketProvider.emitToReception(
                "appointment.waiting",
                 AppointmentDTO.toShortResponse(appointment)
            )
        }catch(error){
            console.warn(
                "⚠️ [Warning] No se pudo notificar al doctor sobre el turno en espera:",
                error.message,
            );
        }


    }

    /**
     * Método para notificar a pantalla que un paciente fue llamado por un doctor
     * 
     * Emite el evento mediate socket
     * 
     * @param {Object} appointment 
     */
    async notifyPatientCalled(appointment){
        try{
            console.log("Notificando a la pantalla")
            this.socketProvider.emitToDashBoard(
                "appointment.called",
                 AppointmentDTO.toShortResponse(appointment)
            );

            console.log("Notificando a recepción")
            this.socketProvider.emitToReception(
                "appointment.called",
                 AppointmentDTO.toShortResponse(appointment)
            )

        }catch(error){
            console.warn(
                "⚠️ [Warning] No se pudo notificar a recepcion ni al dashboard sobre el turno llamado:",
                error.message,
            );
        }
    }


    /**
     * Método para notificar la finalizacion de un turno
     */
    async notifyPatientFinalized(appointment){
        try{

             this.socketProvider.emitToReception(
                "appointment.finalized",
                 AppointmentDTO.toShortResponse(appointment)
            )

        }catch(error){
            console.warn(
                "⚠️ [Warning] No se pudo notificar a recepcion ni al dashboard sobre el turno llamado:",
                error.message,
            );
        }
    }
}

export default new NotificationService()