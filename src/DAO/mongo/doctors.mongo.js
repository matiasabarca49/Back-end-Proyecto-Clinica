/**
 * Módulo para la interacción con la base de datos MongoDB para la colección 'doctors'.
 * Utiliza el servicio de Mongo para obtener, crear, actualizar y eliminar documentos de doctores.
 */
import ServiceMongo from "../../service/dbMongoService.js";
import { sendDoctorFormated, DoctorFormated, sendDoctorsFormated } from "../DTO/doctor.dto.js";
const serviceMongo = new ServiceMongo();

import { Doctor } from "./model/doctorsModel.js";
/**
 * Clase que maneja la lógica de negocios relacionada con los doctores.
 * Utiliza el servicio de Mongo para interactuar con la base de datos.
 */
export default class DoctorsManager {
    constructor() {}

    /**
     * Obtiene todos los doctores.
     * @returns {Array} Arreglo de doctores formateados.
     */

    async getDoctors() {
        const arrayDoctor = await serviceMongo.getDocuments(Doctor);
        return sendDoctorsFormated(arrayDoctor);
    }

    /**
     * Obtiene un doctor por su ID.
     * @param {String} id ID del doctor a buscar.
     * @returns {Object} Objeto con los datos del doctor o false si no existe.
     */

    async getDoctorById(id) {
        const doctorFounded = await serviceMongo.getDocumentByID(Doctor, id);
        return doctorFounded ? sendDoctorFormated(doctorFounded) : false;
    }

    /**
     * Obtiene todos los doctores por el ID de un paciente.
     * @param {String} id ID del paciente.
     * @returns {Object} Arreglo de doctores del paciente o false si no existen.
     */

    async getAllDoctorById(id) {
        const doctorFounded = await serviceMongo.getDocumentByID(Doctor, id);
        return doctorFounded ? doctorFounded : false;
    }

    /**
     * Obtiene los doctores con paginación.
     * @param {Object} dQuery Filtro de búsqueda.
     * @param {Number} dLimit Límite de resultados por página.
     * @param {Number} dPage Página actual.
     * @param {Object} dSort Criterio de ordenación.
     * @returns {Object} Resultado de la paginación de doctores.
     */

    async getDoctorPaginate(dQuery, dLimit, dPage, dSort) {
        const doctorsGetted = await serviceMongo.getDocumentsPaginate(Doctor, dQuery, dLimit, dPage, dSort);
        doctorsGetted && (doctorsGetted.docs = sendDoctorsFormated(doctorsGetted.docs));
        return doctorsGetted ? doctorsGetted : false;
    }

    /**
     * Obtiene los doctores por un filtro específico.
     * @param {Object} filter Filtro de búsqueda.
     * @returns {Object} Doctores filtrados o false si no existen.
     */
    
    async getAllDoctorByFilter(filter) {
        const doctorFounded = await serviceMongo.getDocumentByFilter(Doctor, filter);
        return doctorFounded ? doctorFounded : false;
    }

    /**
     * Obtiene un doctor por un filtro específico.
     * @param {Object} filter Filtro de búsqueda.
     * @returns {Object} Objeto con los datos del doctor o false si no existe.
     */

    async getDoctorByFilter(filter) {
        const doctorFounded = await serviceMongo.getDocumentByFilter(Doctor, filter);
        return doctorFounded ? sendDoctorFormated(doctorFounded) : false;
    }

    /**
     * Crea un nuevo doctor en la base de datos.
     * @param {Object} newDoctor Datos del doctor a crear.
     * @returns {Object} Objeto con los datos del doctor creado.
     */

    async createDoctor(newDoctor) {
        const newDoctorFormated = new DoctorFormated(newDoctor);
        const doctorAdded = await serviceMongo.createDocument(Doctor, newDoctorFormated);
        if(doctorAdded.status){
            //Retorna un usuario Formateado 
            return {...doctorAdded, dt: sendDoctorFormated(doctorAdded.dt)};
        }
        else{
            //En caso de producirse un error al persistir el usuario. Se retorna false
            return doctorAdded
        }
    }

    /**
     * Elimina un doctor por su ID.
     * @param {String} doctorID ID del doctor a eliminar.
     * @returns {Boolean} Resultado de la eliminación.
     */

    deleteDoctor(doctorID) {
        return serviceMongo.deleteDocument(Doctor, doctorID);
    }

    /**
     * Actualiza los datos de un doctor.
     * @param {String} doctorID ID del doctor a actualizar.
     * @param {Object} toUpdate Datos a actualizar.
     * @returns {Boolean} Resultado de la actualización.
     */

    updateDoctor(doctorID, toUpdate) {
        return serviceMongo.updateDocument(Doctor, doctorID, toUpdate);
    }
}
