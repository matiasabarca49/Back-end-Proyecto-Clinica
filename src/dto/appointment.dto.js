import { dateNotHours } from "../utils/dates.helper.js";
import { slotsToHours, slotsToRanges } from "../utils/slots.helper.js";

/**
 * Clase que formatea la información de una cita médica.
 * Se encarga de estructurar los datos recibidos y de prepararlos para ser enviados.
 */
export class AppointmentFormated {
    /**
     * Constructor de la clase.
     * @param {Object} appointment Objeto cita con los datos a formatear.
     */
    constructor(appointment) {
        this.date = dateNotHours(appointment.date);
        this.slots = appointment.slots,
        this.typeAppointment = appointment.typeAppointment;
        this.room = appointment.room;
        this.doctorID = appointment.doctorID;  
        this.patientID = appointment.patientID;  
        this.status = appointment.status;
        this.observations = appointment.observations;
        this.created = appointment.created ||new Date();
        this.lastChange = new Date();
    }

    /**
     * Método para devolver el objeto cita formateado.
     * @returns {Object} Objeto con los datos de la cita en formato estructurado.
     */

    sendAppointment() {
        return {
            id: this._id,  
            date: this.date,
            doctorID: this.doctorID,  
            patientID: this.patientID,  
            status: this.status,
            observations: this.observations,
            created: this.created,
            lastChange: this.lastChange
        };
    }
}

// Corrección en la función de formato
/**
 * Función que recibe una cita y devuelve sus datos formateados.
 * @param {Object} appointment Objeto cita con los datos a formatear.
 * @returns {Object} Objeto con los datos de la cita en formato estructurado.
 */
export const sendAppointmentFormated = (appointment) => {
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
};

/**
 * Función que recibe un arreglo de citas y devuelve un arreglo con los datos de cada una formateados.
 * @param {Array} arrayAppointments Arreglo de objetos citas a formatear.
 * @returns {Array} Arreglo con los datos de las citas en formato estructurado.
 */

export const sendAppointmentsFormated = (arrayAppointments) => {
    const arrayMaped = arrayAppointments.map(appointment => {
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
        }
    })
    return arrayMaped;
};


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
        this.created = appointment.created;
        this.lastChange = appointment.lastChange;
    }

    // Helpers de normalización
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();  
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
        this.status = appointment.status || 'Pending';
        this.observations = appointment.observations;
        this.created = appointment.created;
        this.lastChange = appointment.lastChange;
    }

    normalizeType(typeAppointment){
        if(!typeAppointment) return 'consulta';

        const roles = ["consulta", "cirugia", "control", "tratamiento"];
        const typeLower = typeAppointment.toLowerCase();

        return roles.includes(typeLower) ? typeLower : 'consulta';
    }
      
}

