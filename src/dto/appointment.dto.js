import { dateNotHours } from "../utils/dates.helper.js";
import { slotsToHours, slotsToRanges } from "../utils/slots.helper.js";

/**
 * Clase que formatea la información de una cita médica.
 * Se encarga de estructurar los datos recibidos y de prepararlos para ser enviados.
 */
export class AppointmentDTO{
    constructor(appointment){
        this.date = new Date(appointment.date).setUTCHours(0,0,0,0);
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
            slotsText: slotsToRanges(appointment.slots),
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
    
    static toUpdate(user) {
        const updatedUser = {};
        if (user.name) updatedUser.name = this.capitalize(user.name);
        if (user.lastName) updatedUser.lastName = this.capitalize(user.lastName);
        if (user.email) updatedUser.email = user.emai;
        if (user.rol) updatedUser.rol = user.rol;
        return updatedUser;
    }
}

export class CreateAppointmentDTO{
    constructor(appointment){
        this.date = dateNotHours(appointment.date);
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

