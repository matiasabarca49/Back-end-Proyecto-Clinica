import express from 'express'
import { getDoctors, createDoctor, deleteDoctor, updateDoctor, getDoctorById, getSchedules} from '../controller/doctor.controller.js';
import { authRoles, authToken } from '../middlewares/auth.middlewares.js';
import { validateDoctorData, validateUpdateDoctor } from '../validation/doctor.validation.js';

const {Router} = express
const router = new Router();

/**
 * Obtener todos los doctores
 * 
 * @route GET /api/doctors
 * @access Private(admin, employee)
 * @middleware authToken Verifica el token de autenticación
 * @middleware authRoles("Permisos de roles") Verifica los roles permitidos para acceder a la ruta
 * @returns {Array} Lista de doctores
 */
router.get("/", authToken, authRoles("admin", "employee"), getDoctors);

/**
 * Obtener horarios de doctores
 * 
 * @route GET /api/doctors/schedules
 * @access Private(admin, employee)
 * @middleware authToken, authRoles("admin", "employee")
 * @returns {Array} Lista de horarios de doctores
 */
router.get("/schedules", authToken, authRoles("admin", "employee"), getSchedules);

/**
 * Obtener doctor por ID
 * 
 * @route GET /api/doctors/:id
 * @access Private(admin, employee, doctor)
 * @middleware authToken, authRoles
 * @returns {Object} Doctor con el ID especificado
 */
router.get("/:id", authToken, authRoles("admin", "employee", "doctor"), getDoctorById);

/**
 * Crear un nuevo doctor
 * 
 * @route POST /api/doctors
 * @access Private(admin, employee)
 * @middleware authToken, authRoles
 * @returns {Object} Doctor creado
 */
router.post("/", authToken, authRoles("admin", "employee"), validateDoctorData, createDoctor);

/**
 * Eliminar un doctor
 * 
 * @route DELETE /api/doctors/:id
 * @access Private(admin)
 * @middleware authToken, authRoles
 * @returns {Object} Mensaje de éxito o error
 */
router.delete("/:id", authToken, authRoles("admin"), deleteDoctor);

/**
 * Actualizar un doctor
 * 
 * @route PUT /api/doctors/:id
 * @access Private(admin, employee)
 * @middleware authToken, authRoles
 * @returns {Object} Mensaje de éxito o error
 */
router.put("/:id", authToken, authRoles("admin", "employee"), validateUpdateDoctor, updateDoctor);

export default router