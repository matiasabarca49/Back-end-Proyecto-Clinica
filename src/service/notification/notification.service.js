import socketProvider  from "../../socket/socketProvider.js";

class NotificationService {

    async notifyPatientWaiting(appointment) {

        try{
            console.log("Notificando a doctor")
            socketProvider.emitToDoctor(
                appointment.doctorId,
                "appointment.waiting",
                {
                    appointmentId: appointment.id,
                    patientName: appointment
                }
            );
        }catch(error){
            console.warn(
                "⚠️ [Warning] No se pudo notificar al doctor sobre el turno en espera:",
                error.message,
            );
        }


    }
}

export default new NotificationService()