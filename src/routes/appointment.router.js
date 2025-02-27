import express from 'express';
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments, getAppointmentsByFilter, getAppointmentsPaginate, updateAppointment } from '../controller/appointment.controller.js';

const { Router } = express;
const router = new Router();

// Gets por ID, filtro y todas las entidades
router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.get("/filter/", getAppointmentsByFilter);
router.get("/paginate",getAppointmentsPaginate);
// Crear
router.post("/", createAppointment);

// Eliminar
router.delete("/:id", deleteAppointment);

// Actualizar
router.put("/:id", updateAppointment);

export default router;
