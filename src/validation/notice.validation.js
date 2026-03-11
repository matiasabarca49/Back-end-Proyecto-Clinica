import { body, param } from 'express-validator';
import validate from '../middlewares/validations.middleware.js';

export const validateNoticeData = [
  body('title')
    .exists().withMessage('El título es requerido')
    .notEmpty().withMessage('El título no puede estar vacío')
    .isString().withMessage('El título debe ser un texto')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El título debe tener entre 3 y 100 caracteres'),

  body('description')
    .exists().withMessage('La descripción es requerida')
    .notEmpty().withMessage('La descripción no puede estar vacía')
    .isString().withMessage('La descripción debe ser un texto')
    .trim()
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

  body('date')
    .exists().withMessage('La fecha es requerida')
    .notEmpty().withMessage('La fecha no puede estar vacía')
    .isString().withMessage('La fecha debe ser un texto'),

  body('type')
    .optional()
    .isIn(['important', 'info', 'success', 'warning'])
    .withMessage('El tipo debe ser: important, info, success o warning'),

  body('priority')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('La prioridad debe ser: high, medium o low'),

  body('visibility')
    .optional()
    .isIn(['general', 'particular'])
    .withMessage('La visibilidad debe ser: general o particular'),

  body('targetDoctor')
    .if(body('visibility').equals('particular'))
    .exists().withMessage('El doctor destino es requerido cuando la visibilidad es particular')
    .isMongoId().withMessage('El targetDoctor debe ser un ID válido'),

  validate
];

export const validateUpdateNotice = [
  param('id').isMongoId().withMessage('ID inválido'),

  body('title')
    .optional()
    .isString().withMessage('El título debe ser un texto')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El título debe tener entre 3 y 100 caracteres'),

  body('description')
    .optional()
    .isString().withMessage('La descripción debe ser un texto')
    .trim()
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

  body('date')
    .optional()
    .isString().withMessage('La fecha debe ser un texto'),

  body('type')
    .optional()
    .isIn(['important', 'info', 'success', 'warning'])
    .withMessage('El tipo debe ser: important, info, success o warning'),

  body('priority')
    .optional()
    .isIn(['high', 'medium', 'low'])
    .withMessage('La prioridad debe ser: high, medium o low'),

  body('visibility')
    .optional()
    .isIn(['general', 'particular'])
    .withMessage('La visibilidad debe ser: general o particular'),

  body('targetDoctor')
    .optional()
    .isMongoId().withMessage('El targetDoctor debe ser un ID válido'),

  validate
];