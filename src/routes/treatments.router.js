import express from 'express';
import { getTreatments, getTreatmentByID, getTreatmentByFilter, createTreatment, deleteTreatment, updateTreatment, getTreatmentsPaginate } from '../controller/treatment.controller.js';
import { authToken, checkAuth, checkPermissionsAdmin } from '../utils/middlewares.js';
const { Router } = express;
const router = new Router();

/**
 * Ruta para obtener todos los tratamientos.
 * @route GET /treatments
 * @returns {Array} Lista de tratamientos.
 */
router.get("/", authToken, getTreatments);

/**
 * Ruta para obtener tratamientos con paginación.
 * @route GET /treatments/paginate
 * @param {Number} page Página que se desea mostrar.
 * @param {Number} limit Número de tratamientos por página.
 * @returns {Object} Resultado con datos de tratamientos paginados.
 */
router.get("/paginate/", authToken, getTreatmentsPaginate);

/**
 * Ruta para obtener tratamientos con filtros específicos.
 * @route GET /treatments/filter
 * @param {Object} filter Filtros para la búsqueda de tratamientos.
 * @returns {Array} Lista de tratamientos que cumplen con los filtros.
 */
router.get("/filter/", authToken, getTreatmentByFilter);

/**
 * Ruta para obtener un tratamiento por su ID.
 * @route GET /treatments/:id
 * @param {String} id ID del tratamiento a obtener.
 * @returns {Object} Tratamiento con el ID especificado.
 */
router.get("/:id", authToken, getTreatmentByID);

/**
 * Ruta para crear un nuevo tratamiento.
 * @route POST /treatments
 * @param {Object} treatment Datos del tratamiento a crear.
 * @returns {Object} El tratamiento recién creado.
 */
router.post("/", authToken, checkPermissionsAdmin, createTreatment);

/**
 * Ruta para eliminar un tratamiento por su ID.
 * @route DELETE /treatments/:id
 * @param {String} id ID del tratamiento a eliminar.
 * @returns {String} Mensaje de confirmación.
 */
router.delete("/:id", authToken, checkPermissionsAdmin, deleteTreatment);

/**
 * Ruta para actualizar los datos de un tratamiento por su ID.
 * @route PUT /treatments/:id
 * @param {String} id ID del tratamiento a actualizar.
 * @param {Object} updatedData Datos a actualizar en el tratamiento.
 * @returns {Object} Tratamiento actualizado.
 */
router.put("/:id", authToken, checkPermissionsAdmin, updateTreatment);

export default router;
