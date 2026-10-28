import express from 'express'
import { getDoctors, updateDoctor, getDoctorById, getSchedules} from './doctor.controller.js';
import { authRoles, authToken } from '../../middlewares/auth.middlewares.js';
import { validateUpdateDoctor } from './doctor.validation.js';

const {Router} = express
const router = new Router();

/**
 * Obtener todos los doctores
 * 
 * @route GET /api/doctors
 * @access Private(admin, employee). Doctor no: vería las fichas y horarios de los demás doctores
 * @middleware authToken Verifica el token de autenticación
 * @middleware authRoles("Permisos de roles") Verifica los roles permitidos para acceder a la ruta
 * @returns {Array} Lista de doctores
 */
router.get("/", authToken, authRoles("admin", "employee"), getDoctors);

/**
 * Obtener horarios de doctores
 * 
 * @route GET /api/doctors/schedules
 * @access Private(admin, employee, doctor). Un doctor solo recibe su propio horario
 * @middleware authToken, authRoles("admin", "employee", "doctor")
 * @returns {Array} Lista de horarios de doctores
 */
router.get("/schedules", authToken, authRoles("admin", "employee", "doctor"), getSchedules);

/**
 * Obtener doctor por ID
 * 
 * @route GET /api/doctors/:id
 * @access Private(admin, employee, doctor). Un doctor solo puede pedir su propia ficha
 * @middleware authToken, authRoles
 * @returns {Object} Doctor con el ID especificado
 */
router.get("/:id", authToken, authRoles("admin", "employee", "doctor"), getDoctorById);


/**
 * Actualizar un doctor
 * 
 * @route PUT /api/doctors/:id
 * @access Private(admin). Employee no: el dni y la matrícula son datos de identidad profesional
 * @middleware authToken, authRoles
 * @returns {Object} Mensaje de éxito o error
 */
router.put("/:id", authToken, authRoles("admin"), validateUpdateDoctor, updateDoctor);

export default router