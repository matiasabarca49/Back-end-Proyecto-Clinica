import express from 'express'
import { getDoctors } from '../controller/doctor.controller.js';
const {Router} = express
const router = new Router();
//Gets por ID, Filtro y todas las entidades
router.get("/", getDoctors);
/*
router.get();
router.get();
//Crear
router.post();
//Deletear
router.delete();
//Actualizar
router.put();
*/
export default router