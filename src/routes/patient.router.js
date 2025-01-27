import expres from 'express';
import { createPatient, getPatients, getPatientById, getPatientByFilter, deletePatient, updatePatient, getsPatientsPaginate } from '../controller/patient.controller.js'
const { Router } = expres;
const router = new Router();



router.get("/", getPatients)
router.get("/paginate/", getsPatientsPaginate)
router.get("/filter/", getPatientByFilter)
router.get("/:id", getPatientById)
router.post("/",createPatient)
router.delete("/:id",deletePatient)
router.put("/:id",updatePatient)
export default router
