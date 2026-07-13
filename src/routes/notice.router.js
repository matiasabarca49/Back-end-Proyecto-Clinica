import express from 'express';
import { 
  createNotice, 
  getNotices, 
  getNoticeById, 
  deleteNotice, 
  updateNotice, 
} from '../controller/notice.controller.js';

import { authToken, authRoles } from '../middlewares/auth.middlewares.js';

const router = express.Router();

/**
 * Obtiene todos los avisos visibles para el usuario
 * 
 * @route GET /notices
 * @returns {Array} Lista de avisos
 */
router.get("/", authToken, authRoles("admin", "employee", "doctor"), getNotices);


/**
 * Obtiene un aviso por su ID
 * 
 * @route GET /notices/:id
 * @returns {Object} Aviso encontrado
 */
router.get("/:id", authToken, authRoles("admin", "employee", "doctor"), getNoticeById);

/**
 * Crea un nuevo aviso
 * 
 * @route POST /notices
 * @access Private(Admin y Employee)
 * @returns {Object} Aviso creado
 */
router.post("/", authToken, authRoles("admin", "employee"), createNotice);

/**
 * Actualiza un aviso existente
 * 
 * @route PUT /notices/:id
 * @access Private(Admin y Employee)
 * @returns {Object} Mensaje de éxito o error
 */
router.put("/:id", authToken, authRoles("admin", "employee"), updateNotice);

/**
 * Elimina un aviso
 * 
 * @route DELETE /notices/:id
 * @access Private(Admin y Employee)
 * @returns {Object} Mensaje de éxito o error
 */
router.delete("/:id", authToken, authRoles("admin", "employee"), deleteNotice);

export default router;
