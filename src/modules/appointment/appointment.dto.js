import { dateNotHours } from "../../utils/dates.helper.js";
import { slotsToHours, slotsToRanges } from "../../utils/slots.helper.js";

/**
 * Clase que formatea la información de una cita médica.
 * Se encarga de estructurar los datos recibidos y de prepararlos para ser enviados.
 */
export class AppointmentDTO{
    constructor(appointment){
        this.date = appointment.date;
        this.slots = appointment.slots;
        this.typeAppointment = appointment.typeAppointment;
        this.room = appointment.room;
        this.doctorID = appointment.doctorID;
        this.patientID = appointment.patientID;
        this.status = AppointmentDTO.capitalize(appointment.status);
        this.observations = appointment.observations;
    }

    // Helpers de normalización
    static capitalize(str) {
        return str.toLowerCase();  
    }

    //Salida de datos
    static toResponse(appointment) {
        return {
            id: appointment._id,
            date: appointment.date,
            slots: appointment.slots,
            slotsText: slotsToRanges(appointment.slots, appointment.doctorID.frequency),
            typeAppointment: appointment.typeAppointment,
            room: appointment.room,
            doctorID: appointment.doctorID,
            patientID: appointment.patientID,
            status: appointment.status,
            observations: appointment.observations,
            created: appointment.created,
            lastChange: appointment.lastChange
        };
    }

    static toShortResponse(appointment) {
        return {
            id: appointment._id,
            date: appointment.date,
            slots: appointment.slots,
            slotsText: slotsToRanges(appointment.slots, appointment.doctorID.frequency),
            typeAppointment: appointment.typeAppointment,
            room: appointment.room,
            doctorID: { id: appointment.doctorID.id, name: appointment.doctorID.name, lastName: appointment.doctorID.lastName, email: appointment.doctorID.email,dni: appointment.doctorID.dni, phone: appointment.doctorID.phone, frequency: appointment.doctorID.frequency},
            patientID: { id: appointment.patientID.id, name: appointment.patientID.name, lastName: appointment.patientID.lastName, email: appointment.patientID.email, dni: appointment.patientID.dni, phone: appointment.patientID.phone },
            status: appointment.status
        };
    }
    
    // Solo los campos editables del turno. El estado se cambia con sus endpoints
    // (check-in, call, finalize, status) y el odontograma con /odontogram.
    static toUpdate(appointment) {
        const updatedAppointment = {};
        if (appointment.date) updatedAppointment.date = appointment.date;
        if (appointment.slots) updatedAppointment.slots = appointment.slots;
        if (appointment.typeAppointment) updatedAppointment.typeAppointment = appointment.typeAppointment;
        if (appointment.doctorID) updatedAppointment.doctorID = appointment.doctorID;
        if (appointment.patientID) updatedAppointment.patientID = appointment.patientID;
        // room y observations pueden vaciarse con ""
        if (appointment.room !== undefined) updatedAppointment.room = appointment.room;
        if (appointment.observations !== undefined) updatedAppointment.observations = appointment.observations;
        return updatedAppointment;
    }
}

export class CreateAppointmentDTO{
    constructor(appointment){
        this.date = appointment.date;
        this.slots = appointment.slots || [];
        this.typeAppointment = this.normalizeType(appointment.typeAppointment);
        this.room = appointment.room;
        this.doctorID = appointment.doctorID;
        this.patientID = appointment.patientID;
        this.status = appointment.status || 'pending';
        this.observations = appointment.observations;
    }

    normalizeType(typeAppointment){
        if(!typeAppointment) return 'consulta';

        const roles = ["consulta", "cirugia", "control", "tratamiento"];
        const typeLower = typeAppointment.toLowerCase();

        return roles.includes(typeLower) ? typeLower : 'consulta';
    }
      
}

