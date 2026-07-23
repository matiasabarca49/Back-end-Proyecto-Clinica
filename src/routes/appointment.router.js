import express from 'express';
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments,updateAppointment, getAvailableAppointments, getNearestAppointments, getTodayAppointments,checkInAppointment,callAppointment,
    finalizeAppointment } from '../controller/appointment.controller.js';
import { authRoles, authToken } from '../middlewares/auth.middlewares.js';
import { validateAppointmentData, validateGetAppointmets, validateUpdateAppointment } from '../validation/appointment.validation.js';
const { Router } = express;
const router = new Router();

// ⚠️ ROUTER PROVISORIO SIN AUTENTICACIÓN — SOLO PARA TESTING LOCAL
// ⚠️ Revertir a la versión con authToken/authRoles antes de mergear o deployar

/**
 * @route GET /api/appointments
 */
router.get("/", validateGetAppointmets, getAppointments);

/**
 * @route GET /api/appointments/today
 */
router.get("/today", getTodayAppointments);

/**
 * @route GET /api/appointments/available/:id
 */
router.get("/available/:id", getAvailableAppointments);

/**
 * @route GET /api/appointments/nearest/:id
 */
router.get("/nearest/:id", getNearestAppointments);

/**
 * @route GET /api/appointments/:id
 */
router.get("/:id", getAppointmentById);

/**
 * @route POST /api/appointments
 */
router.post("/", validateAppointmentData, createAppointment);

/**
 * @route DELETE /api/appointments/:id
 */
router.delete("/:id", deleteAppointment);

/**
 * @route PUT /api/appointments/:id
 */
router.put("/:id", validateUpdateAppointment, updateAppointment);

/**
 * @route PATCH /api/appointments/:id/check-in
 */
router.patch("/:id/check-in", checkInAppointment);

/**
 * @route PATCH /api/appointments/:id/call
 */
router.patch("/:id/call", callAppointment);

/**
 * @route PATCH /api/appointments/:id/finalize
 */
router.patch("/:id/finalize", finalizeAppointment);

export default router;