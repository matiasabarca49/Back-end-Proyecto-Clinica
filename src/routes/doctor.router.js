import express from 'express'
import { getDoctors, createDoctor, deleteDoctor, updateDoctor, getDoctorById, getDoctorByFilter, getDoctorsPaginate } from '../controller/doctor.controller.js';
const {Router} = express
const router = new Router();
//Gets por ID, Filtro y todas las entidades
router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.get("/filter/", getDoctorByFilter);
router.get("/paginate",getDoctorsPaginate)
//Crear
router.post("/", createDoctor);
//Deletear
router.delete("/:id", deleteDoctor);
//Actualizar
router.put("/:id", updateDoctor);

export default router