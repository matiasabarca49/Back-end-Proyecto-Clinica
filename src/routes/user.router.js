import expres from 'express';
import {getUsers , getUserByID, createUser, deleteUser, updateUser, searchUsers} from '../controller/user.controller.js'
import { authRoles, authToken } from '../middlewares/auth.middlewares.js';
import { validateUpdateUser, validateUserData } from '../validation/user.validation.js';
const { Router } = expres;
const router = new Router();


/**
 * Obtener todos los usuarios
 * 
 * @route GET /api/users
 * @desc Puede obtener los usuario con paginación y filtrado, o todos los usuarios si no se especifica paginación.
 * @access Private(admin)
 * @middleware authToken, authRoles
 * @returns {Array} Lista de usuarios.
 */
router.get("/", authToken, authRoles("admin"), getUsers)

/**
 * Obtener múltiples usuarios por filtro 
 * 
 * @route GET /api/users/filter
 * @desc Puede obtener los usuario filtrando por query status o rol.
 * @access Private(admin)
 * @middleware authToken, authRoles
 * @returns {Array} Lista de usuarios que coinciden con el filtro.
 */
router.get("/filter/", authToken, authRoles("admin"), searchUsers)

/**
 * @route GET /api/users/{id}
 * @desc Obtener un usuario por ID
 * @access Private(admin)
 * @middleware authToken, authRoles
 * @returns {Object} Usuario con el ID especificado.
 */
router.get("/:id", authToken, authRoles("admin","employee", "doctor"), getUserByID)

/**
 * @route POST /api/users/
 * @desc Crear un nuevo usuario
 * @access Private(Admin)
 * @middleware authToken, authRoles
 * @returns {Object} Usuario recién creado.
 */
router.post("/", authToken, authRoles("admin"), validateUserData,createUser)

/**
 * @route DELETE /api/users/{id}
 * @desc Eliminar un usuario
 * @access Private(Admin)
 * @middleware authToken, authRoles
 * @returns {Object} Mensaje de éxito o error.
 */
router.delete("/:id", authToken, authRoles("admin"), deleteUser)

/**
 * @route PUT /api/users/{id}
 * @desc Actualizar un usuario
 * @access Private(Admin)
 * @middleware authToken, authRoles
 * @returns {Object} Mensaje de éxito o error.
 */
router.put("/:id", authToken, authRoles("admin"), validateUpdateUser, updateUser)

export default router