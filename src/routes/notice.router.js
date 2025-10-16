import express from 'express';
import { 
  createNotice, 
  getNotices, 
  getNoticeById, 
  getNoticeByFilter, 
  deleteNotice, 
  updateNotice, 
  getNoticesPaginate, 
  getNoticeByQuery 
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
 * 🔹 GET /notices/paginate
 * Obtiene avisos paginados
 */
router.get("/paginate", authToken, getNoticesPaginate);

/**
 * 🔹 GET /notices/filter
 * Obtiene avisos con filtros específicos
 */
router.get("/filter", authToken, getNoticeByFilter);

/**
 * 🔹 GET /notices/search
 * Búsqueda avanzada por texto
 */
router.get("/search", authToken, getNoticeByQuery);

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
router.post("/", authToken, authorizeRoles("Admin", "Employee"), createNotice);

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
router.delete("/:id", authToken, authorizeRoles("Admin", "Employee"), deleteNotice);

export default router;
