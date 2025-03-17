import expres from 'express';
import { createPatient, getPatients, getPatientById, getPatientByFilter, deletePatient, updatePatient, getsPatientsPaginate } from '../controller/patient.controller.js'
const { Router } = expres;
const router = new Router();

/**
 * Ruta para obtener todos los pacientes.
 * @route GET /patients
 * @returns {Array} Lista de pacientes
 */
router.get("/", getPatients)

/**
 * Ruta para obtener pacientes con paginación.
 * @route GET /patients/paginate
 * @param {Number} page Página que se desea mostrar.
 * @param {Number} limit Número de pacientes por página.
 * @returns {Object} Resultado con datos de pacientes paginados.
 */
router.get("/paginate/", getsPatientsPaginate)

/**
 * Ruta para obtener pacientes con filtros específicos.
 * @route GET /patients/filter
 * @param {Object} filter Filtros para la búsqueda de pacientes.
 * @returns {Array} Lista de pacientes que cumplen con los filtros.
 */
router.get("/filter/", getPatientByFilter)

/**
 * Ruta para obtener un paciente por su ID.
 * @route GET /patients/:id
 * @param {String} id ID del paciente a obtener.
 * @returns {Object} Paciente con el ID especificado.
 */
router.get("/:id", getPatientById)

/**
 * Ruta para crear un nuevo paciente.
 * @route POST /patients
 * @param {Object} patient Datos del paciente a crear.
 * @returns {Object} El paciente recién creado.
 */
router.post("/", createPatient)

/**
 * Ruta para eliminar un paciente por su ID.
 * @route DELETE /patients/:id
 * @param {String} id ID del paciente a eliminar.
 * @returns {String} Mensaje de confirmación.
 */
router.delete("/:id", deletePatient)

/**
 * Ruta para actualizar los datos de un paciente por su ID.
 * @route PUT /patients/:id
 * @param {String} id ID del paciente a actualizar.
 * @param {Object} updatedData Datos a actualizar en el paciente.
 * @returns {Object} Paciente actualizado.
 */
router.put("/:id", updatePatient)

export default router

