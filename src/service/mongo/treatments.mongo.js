/**
 * Módulo para la interacción con la base de datos MongoDB para la colección 'treatments'.
 * Utiliza el servicio de Mongo para obtener, crear, actualizar y eliminar documentos de tratamientos.
 */
import ServiceMongo from "../../service/dbMongoService.js";
import { sendTreatmentFormated, TreatmentFormated, sendTreatmentsFormated } from "../DTO/treatment.dto.js";
const serviceMongo = new ServiceMongo();
import { Treatment } from "./model/treatmentsModel.js";

/**
 * Clase que maneja la lógica de negocios relacionada con los tratamientos.
 * Utiliza el servicio de Mongo para interactuar con la base de datos.
 */
export default class TreatmentsManager {
    constructor() {}

    /**
     * Obtiene todos los tratamientos.
     * @returns {Array} Arreglo de tratamientos formateados.
     */
    async getTreatments() {
        const treatments = await serviceMongo.getDocuments(Treatment);
        return sendTreatmentsFormated(treatments);
    }

    /**
     * Obtiene un tratamiento por su ID.
     * @param {String} id ID del tratamiento a buscar.
     * @returns {Object} Objeto con los datos del tratamiento o false si no existe.
     */
    async getTreatmentById(id) {
        const treatment = await serviceMongo.getDocumentByID(Treatment, id);
        return treatment ? sendTreatmentFormated(treatment) : false;
    }

    /**
     * Obtiene todos los tratamientos por el ID de paciente.
     * @param {String} id ID del paciente.
     * @returns {Object} Arreglo de tratamientos del paciente o false si no existen.
     */
    async getAllTreatmentById(id) {
        const treatment = await serviceMongo.getDocumentByID(Treatment, id);
        return treatment ? treatment : false;
    }

    /**
     * Obtiene los tratamientos por un filtro específico.
     * @param {Object} filter Filtro de búsqueda.
     * @returns {Object} Tratamientos filtrados o false si no existen.
     */
    async getTreatmentByFilter(filter) {
        const treatments = await serviceMongo.getDocumentByFilter(Treatment, filter);
        return treatments ? sendTreatmentFormated(treatments) : false;
    }

    /**
     * Obtiene los tratamientos con paginación.
     * @param {Object} query Filtro de búsqueda.
     * @param {Number} limit Limite de resultados por página.
     * @param {Number} page Página actual.
     * @param {Object} sort Criterio de ordenación.
     * @returns {Object} Resultado de la paginación de tratamientos.
     */
    async getTreatmentPaginate(query, limit, page, sort) {
        const treatments = await serviceMongo.getDocumentsPaginate(Treatment, query, limit, page, sort);
        treatments && (treatments.docs = sendTreatmentsFormated(treatments.docs));
        return treatments ? treatments : false;
    }

    /**
     * Crea un nuevo tratamiento en la base de datos.
     * @param {Object} newTreatment Datos del tratamiento a crear.
     * @returns {Object} Objeto con los datos del tratamiento creado.
     */
    async createTreatment(newTreatment) {
        const newTreatmentFormated = new TreatmentFormated(newTreatment);
        const treatmentAdded = await serviceMongo.createDocument(Treatment, newTreatmentFormated);
        if(treatmentAdded.status){
            //Retorna un usuario Formateado 
            return newTreatmentFormated.sendUser();
        }
        else{
            //En caso de producirse un error al persistir el usuario. Se retorna false
            return treatmentAdded
        }
    }

    /**
     * Elimina un tratamiento por su ID.
     * @param {String} treatmentID ID del tratamiento a eliminar.
     * @returns {Boolean} Resultado de la eliminación.
     */
    async deleteTreatment(treatmentID) {
        return serviceMongo.deleteDocument(Treatment, treatmentID);
    }

    /**
     * Actualiza los datos de un tratamiento.
     * @param {String} treatmentID ID del tratamiento a actualizar.
     * @param {Object} toUpdate Datos a actualizar.
     * @returns {Boolean} Resultado de la actualización.
     */
    async updateTreatment(treatmentID, toUpdate) {
        return serviceMongo.updateDocument(Treatment, treatmentID, toUpdate);
    }
}
