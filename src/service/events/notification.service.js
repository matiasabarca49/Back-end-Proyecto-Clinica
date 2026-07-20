import { socketProvider } from "../../socket/socketProvider.js";

class NotificationService {

    notifyPatientWaiting(appointment) {

        socketProvider.emitToDoctor(
            appointment.doctorId,
            "appointment.waiting",
            {
                appointmentId: appointment.id,
                patientName: appointment
            }
        );

    }
}

export default new NotificationService()