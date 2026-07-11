import express from 'express'
import { getDoctors, createDoctor, deleteDoctor, updateDoctor, getDoctorById, getSchedules} from '../controller/doctor.controller.js';
import { authToken } from '../middlewares/auth.middlewares.js';
import { validateDoctorData, validateUpdateDoctor } from '../validation/doctor.validation.js';

const {Router} = express
const router = new Router();

// Gets por ID, Filtro y todas las entidades
router.get("/", authToken, getDoctors);
router.get("/schedules", authToken, getSchedules);
router.get("/:id", authToken, getDoctorById);

// Crear
router.post("/", authToken, validateDoctorData, createDoctor);

// Deletear
router.delete("/:id", authToken, deleteDoctor);

// Actualizar
router.put("/:id", authToken, validateUpdateDoctor, updateDoctor);

export default router