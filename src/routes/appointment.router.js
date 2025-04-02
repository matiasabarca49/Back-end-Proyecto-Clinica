import express from 'express';
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments, getAppointmentsByFilter, getAppointmentsPaginate, updateAppointment } from '../controller/appointment.controller.js';
import { authToken, checkAuth, checkPermissionsAdmin } from '../utils/middlewares.js';
const { Router } = express;
const router = new Router();

// Gets por ID, filtro y todas las entidades
router.get("/", authToken, getAppointments);
router.get("/filter/", authToken, getAppointmentsByFilter);
router.get("/:id", authToken, getAppointmentById);
router.get("/paginate", authToken, getAppointmentsPaginate);
// Crear
router.post("/", authToken, checkPermissionsAdmin, createAppointment);

// Eliminar
router.delete("/:id", authToken, checkPermissionsAdmin, deleteAppointment);

// Actualizar
router.put("/:id", authToken, checkPermissionsAdmin, updateAppointment);

export default router;
