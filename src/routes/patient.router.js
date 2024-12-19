import expres from 'express';
import { createPatient, getPatients, getPatientById } from '../controller/patient.controller.js'
const { Router } = expres;
const router = new Router();



router.get("/", getPatients)

router.get("/:id", getPatientById)
router.post("/",createPatient)

export default router