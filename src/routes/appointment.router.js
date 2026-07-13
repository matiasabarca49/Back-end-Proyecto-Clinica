import express from 'express';
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments,updateAppointment, getAvailableAppointments, getNearestAppointments, getTodayAppointments } from '../controller/appointment.controller.js';
import { authRoles, authToken } from '../middlewares/auth.middlewares.js';
import { validateAppointmentData, validateUpdateAppointment } from '../validation/appointment.validation.js';
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
router.get("/", authToken, authRoles("admin", "employee", "doctor"), getAppointments);

/**
 * Obtener turnos para el día de hoy
 * 
 * @route GET /api/appointments/today
 * @access Private
 * @middleware auth y authRoles
 * @return {Array} Lista de turnos para el día de hoy
 */
router.get("/today", authToken, authRoles("admin", "employee", "doctor"),getTodayAppointments);

/**
 * Obtener turnos disponibles para un doctor específico
 * 
 * @route GET /api/appointments/available/:id
 * @access Private
 * @middleware auth y authRoles 
 * @return {Array} Lista de turnos disponibles para el doctor
 */
router.get("/available/:id", authToken, authRoles("admin", "employee", "doctor"),getAvailableAppointments)

/**
 * Obtener los turnos más cercanos a una fecha específica
 * 
 * @route GET /api/appointments/nearest/:id
 * @access Private
 * @middleware auth y authRoles
 * @return {Array} Lista de turnos más cercanos para el usuario
 */
router.get("/nearest/:id", authToken, authRoles("admin", "employee", "doctor"),getNearestAppointments)

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
 * Eliminar un turno por ID
 * 
 * @route DELETE /api/appointments/:id
 * @access Private
 * @middleware auth y authRoles
 * @return {Object} Mensaje de error o éxito
 */
router.delete("/:id", authToken,  authRoles("admin") ,deleteAppointment);

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

export default router;
