import expres from 'express';
import { createPatient, getPatients, getPatientById, deletePatient, updatePatient, getPatientByQuery, getOdontogram, updateTooth, resetOdontogram, addObservation, addTreatment, deleteObservation, deleteTreatment } from '../controller/patient.controller.js'
import { authRoles, authToken } from '../middlewares/auth.middlewares.js';
import { validateAddObservation, validateAddTooth, validateAddTreatment, validateCreatePatient, validateUpdatePatient } from '../validation/patients.validations.js';
const { Router } = expres;
const router = new Router();

/**
 * Ruta para obtener todos los pacientes con o sin paginate.
 * 
 * @route GET /api/patients/
 * @access Private(admin, employee, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos
 * @returns {Array} Lista de pacientes
 */
router.get("/", authToken, authRoles("admin", "employee", "doctor"), getPatients)

/**
 * Ruta para buscar pacientes. Deprecated. Se recomienda usar la ruta /api/patients 
 * 
 * En un futuro se eliminará esta ruta y se implementará la búsqueda avanzada en la ruta /api/patients con query params.
 * 
 * @deprecated usa la ruta /api/patients 
 * @route GET /api/patients/search
 * @access Private(admin, employee, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos
 * @returns {Object} Paciente que coincide con la query especificada.
 */
router.get("/search", authToken, authRoles("admin", "employee", "doctor"), getPatientByQuery)

/**
 * Ruta para obtener un paciente por su ID.
 * 
 * @route GET /api/patients/:id
 * @access Private(admin, employee, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos
 * @returns {Object} Paciente con el ID especificado.
 */
router.get("/:id", authToken, authRoles("admin", "employee", "doctor"), getPatientById)

/**
 * Ruta para obtener odontrograma de un paciente por su ID.
 * 
 * @route GET /api/patients/:patientId/odontogram
 * @access Private(admin, employee, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos
 * @returns {Array} Odontograma del paciente con el ID especificado.
 */
router.get("/:patientId/odontogram", authToken, authRoles("admin", "employee", "doctor"), getOdontogram)


/**
 * Ruta para crear un nuevo paciente.
 * @route POST /patients
 * @access Private(admin, employee)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, employee)
 * @validator validateCreatePatient: Valida los datos del paciente antes de crear el registro
 * @returns {Object} El paciente recién creado.
 */
router.post("/", authToken, authRoles("admin", "employee"), validateCreatePatient, createPatient)

/**
 * Ruta para agregar una actualizacion del odotograma de un paciente por su ID.
 * 
 * @route POST /patients/:patientId/odontogram/:toothId
 * @access Private(admin, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, doctor)
 * @validator validateAddTooth: Valida los datos del diente antes de actualizar el odotograma
 * @returns {Object} Mensaje de exito o error.
 */
router.post("/:patientId/odontogram/:toothId", authToken, authRoles("admin", "doctor"), validateAddTooth, updateTooth)

/** Ruta para agregar una nueva observación a un paciente por su ID.
 * @route POST /patients/:id/observations
 * @access Private(admin, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, doctor)
 * @validator validateAddObservation: Valida los datos de la observacion
 * @returns {Object} Paciente actualizado con la nueva observación.
 */
router.post("/:id/observations", authToken, authRoles("admin", "doctor"), validateAddObservation, addObservation)

/** 
 * Ruta para agregar un nuevo tratamiento a un paciente por su ID.
 * 
 * @route POST /patients/:id/treatments
 * @access Private(admin, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, doctor)
 * @validator validateAddTreatment: Valida los datos del tratamiento
 * @returns {Object} Paciente actualizado con el nuevo tratamiento.
 */
router.post("/:id/treatments", authToken, authRoles("admin", "doctor"), validateAddTreatment, addTreatment)

/**
 * Ruta para actualizar los datos de un paciente por su ID.
 * 
 * @route PUT /patients/:id
 * @access Private(admin, doctor, employee)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, doctor)
 * @validator validateUpdatePatient: Valida los datos de la observacion
 * @returns {Object} Paciente actualizado.
 */
router.put("/:id", authToken, authRoles("admin", "employee", "doctor"), validateUpdatePatient, updatePatient)


/**
 * Ruta para eliminar un paciente por su ID.
 * @route DELETE /patients/:id
 * @access Private(admin)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, doctor)
 * @returns {Object} Paciente eliminado con mensaje de éxito o mensaje de error.
 */
router.delete("/:id", authToken, authRoles("admin"), deletePatient)

/**
 * Ruta para resetear el odotograma de un paciente por su ID.
 * 
 * @route DELETE /api/patients/:patientId/odontogram
 * @access Private(admin)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, doctor)
 * @returns {Object}
 */
router.delete("/:patientId/odontogram", authToken, authRoles("admin"), resetOdontogram)

/**
 * Ruta para eliminar una observación específica de un paciente por su ID.
 * 
 * @route DELETE /patients/:patientId/observation/:idObservation
 * @access Private(admin, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, doctor)
 * @returns {Object}
 */
router.delete("/:patientId/observation/:idObservation", authToken, authRoles("admin", "doctor"), deleteObservation )

/**
 * Ruta para eliminar un tratamiento específico de un paciente por su ID.
 * 
 * @route DELETE /patients/:patientId/treatment/:idTreatment
 * @access Private(admin, doctor)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @middleware authRoles: Verifica que el usuario tenga uno de los roles permitidos (admin, doctor)
 * @returns {Object}
 */
router.delete("/:patientId/treatment/:idTreatment", authToken, authRoles("admin", "doctor"), deleteTreatment )


export default router

