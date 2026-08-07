import logger from "../../core/logger/logger.js";
import socketProvider  from "../../core/socket/socketProvider.js";

class AppointmentNotificationService {

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
            this.socketProvider.emitToDashBoard(
                "appointment.waiting",
                 appointment
            );

            this.socketProvider.emitToDoctor(
                appointment.doctorID.id,
                "appointment.waiting",
                appointment
            );

            this.socketProvider.emitToReception(
                "appointment.waiting",
                 appointment
            )
        }catch(error){
            logger.error({
                message: "No se pudo notificar sobre el turno en espera",
                error: error.message,
                stack: error.stack
            });
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
            this.socketProvider.emitToDashBoard(
                "appointment.called",
                 appointment
            );

            this.socketProvider.emitToReception(
                "appointment.called",
                 appointment
            )

            this.socketProvider.emitToDoctor(
                appointment.doctorID.id,
                "appointment.called",
                appointment
            )

        }catch(error){
            logger.error({
                message: "No se pudo notificar sobre el turno llamado",
                error: error.message,
                stack: error.stack
            });
        }
    }


    /**
     * Método para notificar la finalizacion de un turno
     */
    async notifyPatientFinalized(appointment){
        try{

             this.socketProvider.emitToReception(
                "appointment.finalized",
                 appointment
            )

            this.socketProvider.emitToDoctor(
                appointment.doctorID.id,
                "appointment.finalized",
                appointment
            )

        }catch(error){
            logger.error({
                message: "No se pudo notificar sobre el turno finalizado",
                error: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Método para notificar a recepcion un cambio de estado
     * 
     * Emite el evento mediate socket
     * 
     * @param {Object} appointment 
     */
    async notifyChangeStatusApp(appointment){
        try{
            
            this.socketProvider.emitToReception(
                "appointment.change",
                 appointment
            )

        }catch(error){
            logger.error({
                message: "No se pudo notificar sobre el cambio de estado del turno",
                error: error.message,
                stack: error.stack
            });
        }
    }
}

export default new AppointmentNotificationService()