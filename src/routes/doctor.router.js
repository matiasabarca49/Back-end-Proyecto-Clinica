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
router.post("/", authToken,checkPermissionsAdmin, createDoctor);
//Deletear
router.delete("/:id", authToken, checkPermissionsAdmin, deleteDoctor);
//Actualizar
router.put("/:id",authToken, checkPermissionsAdmin, updateDoctor);

export default router