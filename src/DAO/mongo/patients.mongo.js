/**
 * Módulo para la interacción con la base de datos MongoDB para la colección 'patients'.
 * Utiliza el servicio de Mongo para obtener, crear, actualizar y eliminar documentos.
 */
import ServiceMongo from "../../service/dbMongoService.js";
import { PatientFormated, sendPatientFormated, sendPatientsFormated } from "../DTO/patient.dto.js";
const serviceMongo = new ServiceMongo();

import { Patient } from "./model/patientsModel.js";

/**
 * Clase que maneja la lógica de negocios relacionada con los pacientes.
 * Utiliza el servicio de Mongo para interactuar con la base de datos.
 */
export default class PatientsManager {
    constructor() {}

    /**
     * Obtiene todos los pacientes.
     * @returns {Array} Arreglo de pacientes formateados.
     */
    async getPatients() {
        const arrayPatient = await serviceMongo.getDocuments(Patient);
        return sendPatientsFormated(arrayPatient);
    }

    /**
     * Obtiene un paciente por su ID.
     * @param {String} id ID del paciente a buscar.
     * @returns {Object} Objeto con los datos del paciente o null si no existe.
     */
    async getPatientById(id) {
        const patientFounded = await serviceMongo.getDocumentByID(Patient, id);
        return patientFounded ? sendPatientFormated(patientFounded) : null;
    }

    /**
     * Obtiene un paciente usando un filtro específico.
     * @param {Object} filter Filtro de búsqueda.
     * @returns {Object} Objeto con los datos del paciente o null si no existe.
     */
    async getPatientByFilter(filter) {
        const patientFounded = await serviceMongo.getDocumentByFilter(Patient, filter);
        return patientFounded ? sendPatientFormated(patientFounded) : null;
    }

    /**
     * Obtiene los pacientes con paginación.
     * @param {Object} dQuery Filtro de búsqueda.
     * @param {Number} dLimit Limite de resultados por página.
     * @param {Number} dPage Página actual.
     * @param {Object} dSort Criterio de ordenación.
     * @returns {Object} Resultado de la paginación de pacientes.
     */
    async getPatientPaginate(dQuery, dLimit, dPage, dSort) {
        const patientsGetted = await serviceMongo.getDocumentsPaginate(Patient, dQuery, dLimit, dPage, dSort);
        if (patientsGetted) {
            patientsGetted.docs = sendPatientsFormated(patientsGetted.docs);
        }
        return patientsGetted ? patientsGetted : false;
    }

    /**
     * Crea un nuevo paciente en la base de datos.
     * @param {Object} newPatient Datos del paciente a crear.
     * @returns {Object} Objeto con los datos del paciente creado.
     */
    async createPatient(newPatient) {
        const patientFormatted = new PatientFormated(newPatient);
        const patientAdded = await serviceMongo.createDocument(Patient, patientFormatted);
        return patientAdded;
    }

    /**
     * Elimina un paciente por su ID.
     * @param {String} patientID ID del paciente a eliminar.
     * @returns {Boolean} Resultado de la eliminación.
     */
    deletePatient(patientID) {
        return serviceMongo.deleteDocument(Patient, patientID);
    }

    /**
     * Actualiza los datos de un paciente.
     * @param {String} patientID ID del paciente a actualizar.
     * @param {Object} toUpdate Datos a actualizar.
     * @returns {Boolean} Resultado de la actualización.
     */
    updatePatient(patientID, toUpdate) {
        return serviceMongo.updateDocument(Patient, patientID, toUpdate);
    }
}
