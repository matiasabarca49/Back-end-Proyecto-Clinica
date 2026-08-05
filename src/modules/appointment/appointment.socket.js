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
                 appointment
            )

            this.socketProvider.emitToDoctor(
                appointment.doctorID.id,
                "appointment.finalized",
                appointment
            )

        }catch(error){
            console.warn(
                "⚠️ [Warning] No se pudo notificar a recepcion ni al dashboard sobre el turno llamado:",
                error.message,
            );
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
            console.warn(
                "⚠️ [Warning] No se pudo notificar a recepcion ni al dashboard sobre el turno llamado:",
                error.message,
            );
        }
    }
}

export default new AppointmentNotificationService()