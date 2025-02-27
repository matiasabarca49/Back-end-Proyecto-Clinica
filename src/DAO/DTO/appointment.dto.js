export class AppointmentFormated {
    constructor(appointment) {
        this.id = appointment._id;
        this.date = appointment.date;
        this.doctor = appointment.doctorID;
        this.patient = appointment.patientID;
        this.status = appointment.status;
        this.observations = appointment.observations;
    }

    sendAppointment() {
        return {
            id: this.id,
            date: this.date,
            doctor: this.doctor,
            patient: this.patient,
            status: this.status,
            observations: this.observations
        };
    }
}

export const sendAppointmentFormated = (appointment) => {
    return {
        id: appointment._id,
        date: appointment.date,
        doctor: appointment.doctorID,
        patient: appointment.patientID,
        status: appointment.status,
        observations: appointment.observations
    };
};

export const sendAppointmentsFormated = (arrayAppointments) => {
    return arrayAppointments.map(appointment => ({
        id: appointment._id,
        date: appointment.date,
        doctor: appointment.doctorID,
        patient: appointment.patientID,
        status: appointment.status,
        observations: appointment.observations
    }));
};
