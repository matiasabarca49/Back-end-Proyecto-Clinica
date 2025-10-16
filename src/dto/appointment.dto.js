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

