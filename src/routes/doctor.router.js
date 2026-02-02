import express from 'express'
import { getDoctors, createDoctor, deleteDoctor, updateDoctor, getDoctorById} from '../controller/doctor.controller.js';
import { authToken } from '../middlewares/middlewares.js';
const {Router} = express
const router = new Router();
//Gets por ID, Filtro y todas las entidades
router.get("/", authToken, getDoctors);
router.get("/:id",authToken, getDoctorById);
//Crear
router.post("/", authToken, createDoctor);
//Deletear
router.delete("/:id", authToken, deleteDoctor);
//Actualizar
router.put("/:id",authToken, updateDoctor);

export default router