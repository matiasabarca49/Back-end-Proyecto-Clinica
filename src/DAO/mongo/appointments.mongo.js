/**
 * Módulo para la interacción con la base de datos MongoDB para la colección 'appointments'.
 * Utiliza el servicio de Mongo para obtener, crear, actualizar y eliminar documentos de citas médicas.
 */
import ServiceMongo from "../../service/dbMongoService.js";
import { sendAppointmentFormated, AppointmentFormated, sendAppointmentsFormated } from "../DTO/appointment.dto.js";
const serviceMongo = new ServiceMongo();

import { Appointment } from "./model/appointmentsModel.js";
/**
 * Clase que maneja la lógica de negocios relacionada con las citas médicas.
 * Utiliza el servicio de Mongo para interactuar con la base de datos.
 */
export default class AppointmentsManager {
    constructor() {}

    /**
     * Obtiene todas las citas médicas.
     * @returns {Array} Arreglo de citas médicas formateadas.
     */

    async getAppointments() {
        const arrayAppointments = await serviceMongo.getDocuments(Appointment);
        return sendAppointmentsFormated(arrayAppointments);
    }

    /**
     * Obtiene una cita médica por su ID.
     * @param {String} id ID de la cita a buscar.
     * @returns {Object} Objeto con los datos de la cita o false si no existe.
     */

    async getAppointmentById(id) {
        const appointmentFound = await serviceMongo.getDocumentByID(Appointment, id);
        return appointmentFound ? sendAppointmentFormated(appointmentFound) : false;
    }

    /**
     * Obtiene todas las citas médicas por el ID de un paciente.
     * @param {String} id ID del paciente.
     * @returns {Object} Arreglo de citas del paciente o false si no existen.
     */

    async getAllAppointmentById(id) {
        const appointmentFound = await serviceMongo.getDocumentByID(Appointment, id);
        return appointmentFound ? appointmentFound : false;
    }

    /**
     * Obtiene las citas médicas con paginación.
     * @param {Object} dQuery Filtro de búsqueda.
     * @param {Number} dLimit Límite de resultados por página.
     * @param {Number} dPage Página actual.
     * @param {Object} dSort Criterio de ordenación.
     * @returns {Object} Resultado de la paginación de citas médicas.
     */

    async getAppointmentsPaginate(dQuery, dLimit, dPage, dSort) {
        const appointmentsGetted = await serviceMongo.getDocumentsPaginate(Appointment, dQuery, dLimit, dPage, dSort);
        appointmentsGetted && (appointmentsGetted.docs = sendAppointmentsFormated(appointmentsGetted.docs));
        return appointmentsGetted ? appointmentsGetted : false;
    }

    /**
     * Obtiene las citas médicas por un filtro específico.
     * @param {Object} filter Filtro de búsqueda.
     * @returns {Object} Citas médicas filtradas o false si no existen.
     */

    async getAppointmentsByFilter(filter) {
        const appointmentsFounded = await serviceMongo.getDocumentByFilter(Appointment, filter);
        return appointmentsFounded ? appointmentsFounded : false;
    }

    /**
     * Obtiene una cita médica por un filtro específico.
     * @param {Object} filter Filtro de búsqueda.
     * @returns {Object} Objeto con los datos de la cita médica o false si no existe.
     */

    async getAppointmentByFilter(filter) {
        const appointmentFounded = await serviceMongo.getDocumentByFilter(Appointment, filter);
        return appointmentFounded ? sendAppointmentFormated(appointmentFounded) : false;
    }

    /**
     * Crea una nueva cita médica en la base de datos.
     * @param {Object} newAppointment Datos de la cita médica a crear.
     * @returns {Object} Objeto con los datos de la cita creada.
     */

    async createAppointment(newAppointment) {
        const newAppointmentFormated = new AppointmentFormated(newAppointment);
        const appointmentAdded = await serviceMongo.createDocument(Appointment, newAppointmentFormated);
        if (appointmentAdded) {
            return newAppointmentFormated.sendAppointment();
        } else {
            return false;
        }
    }

    /**
     * Elimina una cita médica por su ID.
     * @param {String} appointmentID ID de la cita médica a eliminar.
     * @returns {Boolean} Resultado de la eliminación.
     */

    deleteAppointment(appointmentID) {
        return serviceMongo.deleteDocument(Appointment, appointmentID);
    }

    /**
     * Actualiza los datos de una cita médica.
     * @param {String} appointmentID ID de la cita médica a actualizar.
     * @param {Object} toUpdate Datos a actualizar.
     * @returns {Boolean} Resultado de la actualización.
     */

    updateAppointment(appointmentID, toUpdate) {
        return serviceMongo.updateDocument(Appointment, appointmentID, toUpdate);
    }
}
