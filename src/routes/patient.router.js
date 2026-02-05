import expres from 'express';
import { createPatient, getPatients, getPatientById, deletePatient, updatePatient, getPatientByQuery, getOdontogram, updateTooth, resetOdontogram } from '../controller/patient.controller.js'
import { authToken, checkPermissionsAdmin } from '../middlewares/middlewares.js';
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
 * Ruta para obtener odontrograma de un paciente por su ID.
 * @route GET /patients/:patientId/odontogram
 * @param {String} patientId ID del paciente a obtener.
 * @returns {Object} Paciente con el ID especificado.
 */
router.get("/:patientId/odontogram", authToken, getOdontogram)




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
 * Ruta para resetear el odotograma de un paciente por su ID.
 * @route PUT /patients/:patientId/odontogram/:toothId
 * @param {String} patientId ID del paciente a actualizar.
 */
router.delete("/:patientId/odontogram", authToken, checkPermissionsAdmin, resetOdontogram)

/**
 * Ruta para actualizar los datos de un paciente por su ID.
 * @route PUT /patients/:id
 * @param {String} id ID del paciente a actualizar.
 * @param {Object} updatedData Datos a actualizar en el paciente.
 * @returns {Object} Paciente actualizado.
 */
router.put("/:id", authToken, updatePatient)

/**
 * Ruta para actualizar el odotograma de un paciente por su ID.
 * @route PUT /patients/:patientId/odontogram/:toothId
 * @param {String} patientId ID del paciente a actualizar.
 * @param {String} toothId ID o numero de diente del paciente a actualizar.
 * @query {Object} toothData Datos a actualizar en el paciente.
 * @returns {Object} Paciente actualizado.
 */
router.put("/:patientId/odontogram/:toothId", authToken, updateTooth)


export default router

