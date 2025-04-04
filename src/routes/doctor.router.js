import express from 'express'
import { getDoctors, createDoctor, deleteDoctor, updateDoctor, getDoctorById, getDoctorByFilter, getDoctorsPaginate } from '../controller/doctor.controller.js';
import { authToken, checkAuth, checkPermissionsAdmin } from '../utils/middlewares.js';
const {Router} = express
const router = new Router();
//Gets por ID, Filtro y todas las entidades
router.get("/", authToken, getDoctors);
router.get("/filter/",authToken, getDoctorByFilter);
router.get("/:id",authToken, getDoctorById);
router.get("/paginate", authToken, getDoctorsPaginate)
//Crear
router.post("/", authToken, createDoctor);
//Deletear
router.delete("/:id", authToken, deleteDoctor);
//Actualizar
router.put("/:id",authToken, updateDoctor);

export default router