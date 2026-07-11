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
router.post("/", authToken, authRoles("admin", "employee"), createNotice);

/*
 * 🔹 PUT /notices/:id
 * Actualiza un aviso existente
 * Solo Admin y Employee
 */
router.put("/:id", authToken, authRoles("admin", "employee"), updateNotice);

/**
 * 🔹 DELETE /notices/:id
 * Elimina un aviso
 * Solo Admin y Employee
 */
router.delete("/:id", authToken, authRoles("admin", "employee"), deleteNotice);

export default router;
