import express from 'express';
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments,updateAppointment, getAvailableAppointments, getNearestAppointments, getTodayAppointments } from '../controller/appointment.controller.js';
import { authToken } from '../middlewares/auth.middlewares.js';
import { validateAppointmentData, validateUpdateAppointment } from '../validation/appointment.validation.js';
const { Router } = express;
const router = new Router();

// Gets por ID, filtro y todas las entidades
router.get("/", authToken, getAppointments);
router.get("/today", authToken, getTodayAppointments);
//Busqueda
router.get("/available/:id", authToken, getAvailableAppointments)
router.get("/nearest/:id", authToken, getNearestAppointments)
router.get("/:id", authToken, getAppointmentById);
// Crear
router.post("/", authToken, validateAppointmentData, createAppointment);


// Eliminar
router.delete("/:id", authToken, deleteAppointment);

// Actualizar
router.put("/:id", authToken, validateUpdateAppointment, updateAppointment);

export default router;
