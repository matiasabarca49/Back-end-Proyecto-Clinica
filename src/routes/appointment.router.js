import express from 'express';
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments, getAppointmentsByFilter, getAppointmentsPaginate, getAppointmentByQuery,updateAppointment } from '../controller/appointment.controller.js';
import { authToken } from '../middlewares/middlewares.js';
const { Router } = express;
const router = new Router();

// Gets por ID, filtro y todas las entidades
router.get("/", authToken, getAppointments);
router.get("/filter/", authToken, getAppointmentsByFilter);
//Busqueda
router.get("/paginate", authToken, getAppointmentsPaginate);
router.get("/search", authToken, getAppointmentByQuery)
router.get("/:id", authToken, getAppointmentById);
// Crear
router.post("/", authToken, createAppointment);


// Eliminar
router.delete("/:id", authToken, deleteAppointment);

// Actualizar
router.put("/:id", authToken, updateAppointment);

export default router;
