import expres from 'express';
import { createPatient, getPatients, getPatientById, deletePatient, updatePatient, getPatientByQuery } from '../controller/patient.controller.js'
import { authToken } from '../middlewares/middlewares.js';
const { Router } = expres;
const router = new Router();

/**
 * Ruta para obtener todos los pacientes con o sin paginate.
 * @route GET /patients
 * @returns {Array} Lista de pacientes
 */
router.get("/", authToken, getPatients)

/**
 * Ruta para buscar pacientes.
 * @route GET /patients/search
 * @query {String} .
 * @returns {Object} Paciente con que coincida con la query especificada.
 */
router.get("/search", authToken, getPatientByQuery)

/**
 * Ruta para obtener un paciente por su ID.
 * @route GET /patients/:id
 * @param {String} id ID del paciente a obtener.
 * @returns {Object} Paciente con el ID especificado.
 */
router.get("/:id", authToken, getPatientById)


/**
 * Ruta para crear un nuevo paciente.
 * @route POST /patients
 * @param {Object} patient Datos del paciente a crear.
 * @returns {Object} El paciente recién creado.
 */
router.post("/", authToken, createPatient)

/**
 * Ruta para eliminar un paciente por su ID.
 * @route DELETE /patients/:id
 * @param {String} id ID del paciente a eliminar.
 * @returns {String} Mensaje de confirmación.
 */
router.delete("/:id", authToken, deletePatient)

/**
 * Ruta para actualizar los datos de un paciente por su ID.
 * @route PUT /patients/:id
 * @param {String} id ID del paciente a actualizar.
 * @param {Object} updatedData Datos a actualizar en el paciente.
 * @returns {Object} Paciente actualizado.
 */
router.put("/:id", authToken, updatePatient)

export default router

