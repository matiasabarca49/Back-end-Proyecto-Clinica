import express from 'express';
import { createAppointment, getAppointmentById, getAppointments,updateAppointment, getAvailableAppointments, getNearestAppointments, getTodayAppointments,checkInAppointment,callAppointment,
    finalizeAppointment, 
    changeStatusAppointment,
    upsertAppointmentTooth,
    getAppointmentOdontogram,
    getAvailability} from './appointment.controller.js';
import { authRoles, authToken } from '../../middlewares/auth.middlewares.js';
import { validateAppointmentData, validateChangeStatusAppointment, validateGetAppointmets, validateUpdateAppointment, validateUpsertTooth, validateGetOdontogram, validateGetAvailable, validateGetNearest, validateGetAvailability, validateCheckIn } from './appointment.validation.js';
const { Router } = express;
const router = new Router();

/**
 * Obtener todos los turnos
 * 
 * @route GET /api/appointments
 * @access Private
 * @middleware authToken Verifica el token de autenticación
 * @middleware authRoles Verifica que el usuario tenga el rol adecuado
 * @return {Array} Lista de turnos
 */
router.get("/", authToken, authRoles("admin", "employee", "doctor"), validateGetAppointmets, getAppointments);

/**
 * Obtener turnos para el día de hoy
 * 
 * @route GET /api/appointments/today
 * @access Private
 * @middleware auth y authRoles
 * @return {Array} Lista de turnos para el día de hoy
 */
router.get("/today", authToken, authRoles("admin", "employee", "doctor", "dashboard"),getTodayAppointments);

/**
 * Obtener la grilla de un doctor en un día: slots libres y ocupados
 *
 * @route GET /api/appointments/available/:id?day=YYYY-MM-DD
 * @access Private(admin, employee, doctor). Un doctor solo puede consultar el suyo
 * @middleware auth y authRoles
 * @validation validateGetAvailable
 * @return {Object} { date, duration, slots, occupiedSlots } con los slots en minutos del día
 */
router.get("/available/:id", authToken, authRoles("admin", "employee", "doctor"), validateGetAvailable, getAvailableAppointments)

/**
 * Obtener el día más cercano con slots libres de un doctor, a partir de mañana
 *
 * @route GET /api/appointments/nearest/:id
 * @access Private(admin, employee, doctor). Un doctor solo puede consultar el suyo
 * @middleware auth y authRoles
 * @validation validateGetNearest
 * @return {Object} { date, duration, slots, slotsText } del día encontrado
 */
router.get("/nearest/:id", authToken, authRoles("admin", "employee", "doctor"), validateGetNearest, getNearestAppointments)

/**
 * Obtener la disponibilidad diaria de un doctor en un rango, para el calendario
 *
 * Va antes de /:id: si no, "availability" se tomaría como el ID de un turno.
 *
 * @route GET /api/appointments/availability?doctor=ID&from=YYYY-MM-DD&to=YYYY-MM-DD
 * @access Private(admin, employee, doctor). Un doctor solo puede consultar el suyo
 * @middleware auth y authRoles
 * @validation validateGetAvailability
 * @return {Object} { doctorID, frequency, from, to, days: [{ date, status, total, occupied, free }] }
 */
router.get("/availability", authToken, authRoles("admin", "employee", "doctor"), validateGetAvailability, getAvailability)

/**
 * Obtener un turno por ID
 * 
 * @route GET /api/appointments/:id
 * @access Private
 * @middleware auth y authRoles
 * @return {Object} Turno encontrado
 */
router.get("/:id", authToken, authRoles("admin", "employee", "doctor"),getAppointmentById);

/**
 * Crear un nuevo turno
 * 
 * @route POST /api/appointments
 * @access Private
 * @middleware auth y authRoles
 * @validation validateAppointmentData
 * @return {Object} Turno creado
 */
router.post("/", authToken, authRoles("admin", "employee", "doctor"), validateAppointmentData, createAppointment);


/**
 * Actualizar un turno por ID
 * 
 * @route PUT /api/appointments/:id
 * @access Private
 * @middleware auth y authRoles
 * @validation validateUpdateAppointment
 * @return {Object} Mensaje de error o éxito
 */
router.put("/:id", authToken,  authRoles("admin", "employee", "doctor"), validateUpdateAppointment, updateAppointment);

/**
 * Actualizar el estado de un turno a check-in
 * 
 * Esto permite generar un evento que notifica al doctor
 * 
 * @route PATCH /api/appointments/:id/check-in
 * @middleware auth y authRoles
 * @return {Object} Mensaje de error o éxito
 */
router.patch("/:id/check-in", authToken, authRoles("admin", "employee", "doctor"), validateCheckIn, checkInAppointment);

/**
 * Actualizar el estado de un turno a llamado
 * 
 * Esto permite generar un evento que notifica al doctor
 * 
 * @route PATCH /api/appointments/:id/call
 * @middleware auth y authRoles
 * @return {Object} Mensaje de error o éxito
 */
router.patch("/:id/call",authToken,authRoles("admin", "doctor"),callAppointment);

/**
 * Actualizar el estado de un turno a finalizado
 * 
 * Guarda el odontograma del turno en el del paciente y genera un evento que notifica al doctor
 * 
 * @route PATCH /api/appointments/:id/finalize
 * @middleware auth y authRoles
 * @return {Object} Mensaje de error o éxito
 */
router.patch("/:id/finalize",authToken,authRoles("admin", "doctor"),finalizeAppointment);

/**
 * Actualizar el estado de un turno a finalizado
 * 
 * Esto permite generar un evento que notifica a recepcion
 * 
 * @route PATCH /api/appointments/:id/status
 * @middleware auth y authRoles
 * @return {Object} Mensaje de error o éxito
 */
router.patch("/:id/status",authToken,authRoles("admin", "employee"), validateChangeStatusAppointment, changeStatusAppointment);

/**
 * Obtener el odontograma de un turno
 * 
 * Separado de GET /:id porque son datos clínicos: solo admin y doctor.
 * 
 * @route GET /api/appointments/:id/odontogram
 * @access Private
 * @middleware auth y authRoles
 * @validation validateGetOdontogram
 * @return {Array} Odontograma del turno
 */
router.get("/:id/odontogram", authToken, authRoles("admin", "doctor"), validateGetOdontogram, getAppointmentOdontogram);

/**
 * Agregar, reemplazar o quitar un diente en el odontograma del turno
 * 
 * Solo mientras el turno está en consulta (called). El body trae el estado completo del diente:
 * si ya está en el turno se reemplaza, y si llega sin tratar se quita.
 * 
 * @route POST /api/appointments/:id/odontogram
 * @access Private
 * @middleware auth y authRoles
 * @validation validateUpsertTooth
 * @return {Array} Odontograma del turno
 */
router.post("/:id/odontogram", authToken, authRoles("admin", "doctor"), validateUpsertTooth, upsertAppointmentTooth);

export default router;
