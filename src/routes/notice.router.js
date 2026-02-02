import express from 'express';
import { 
  createNotice, 
  getNotices, 
  getNoticeById, 
  deleteNotice, 
  updateNotice, 
} from '../controller/notice.controller.js';

import { authToken } from '../middlewares/middlewares.js';
import { authorizeRoles } from '../middlewares/middlewares.js';

const router = express.Router();

/**
 * 🔹 GET /notices
 * Obtiene todos los avisos visibles para el usuario
 */
router.get("/", authToken, getNotices);


/**
 * 🔹 GET /notices/:id
 * Obtiene un aviso por su ID
 */
router.get("/:id", authToken, getNoticeById);

/**
 * 🔹 POST /notices
 * Crea un nuevo aviso
 * Solo Admin y Employee
 */
router.post("/", authToken, authorizeRoles("admin", "employee"), createNotice);

/**
 * 🔹 PUT /notices/:id
 * Actualiza un aviso existente
 * Solo Admin y Employee
 */
router.put("/:id", authToken, authorizeRoles("Admin", "Employee"), updateNotice);

/**
 * 🔹 DELETE /notices/:id
 * Elimina un aviso
 * Solo Admin y Employee
 */
router.delete("/:id", authToken, authorizeRoles("admin", "employee"), deleteNotice);

export default router;
