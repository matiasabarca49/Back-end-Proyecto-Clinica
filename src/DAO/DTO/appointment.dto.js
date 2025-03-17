export class AppointmentFormated {
    constructor(appointment) {
        this.id = appointment._id;
        this.date = appointment.date;
        this.doctorID = appointment.doctorID;  
        this.patientID = appointment.patientID;  
        this.status = appointment.status;
        this.observations = appointment.observations;
    }

    sendAppointment() {
        return {
            id: this._id,  
            date: this.date,
            doctorID: this.doctorID,  
            patientID: this.patientID,  
            status: this.status,
            observations: this.observations
        };
    }
}

// Corrección en la función de formato
export const sendAppointmentFormated = (appointment) => {
    return {
        id: appointment._id,
        date: appointment.date,
        doctorID: appointment.doctorID,  
        patientID: appointment.patientID,  
        status: appointment.status,
        observations: appointment.observations
    };
};

export const sendAppointmentsFormated = (arrayAppointments) => {
    const arrayMaped = arrayAppointments.map(appointment => {
        return {
            id: appointment._id,
            date: appointment.date,
            doctor: appointment.doctorID,
            patient: appointment.patientID,
            status: appointment.status,
            observations: appointment.observations
        }
    })
    return arrayMaped;
};
