import { body, param, query } from 'express-validator';
import validate from '../middlewares/validations.middleware.js';

export const validateGetAppointmets = [
  query("doctor")
    .optional()
    .isString().withMessage("Debe ser un string"),
  query("patient")
    .optional()
    .isString().withMessage("Debe ser un string"),
  query("from")
    .optional()
    .isDate({
            format: "YYYY-MM-DD",
            strictMode: true
        })
        .withMessage("La fecha debe tener formato  YYYY-MM-DD"),
  query("to")
    .optional()
    .isDate({
            format: "YYYY-MM-DD",
            strictMode: true
        })
        .withMessage("La fecha debe tener formato  YYYY-MM-DD"),
  query("room")
    .optional()
    .isString().withMessage("Debe ser un string"),
  query("typeAppointment")
    .optional()
    .isString().withMessage("Debe ser un string")
    .isIn(["consulta", "cirugia", "control", "tratamiento"]),
  query("status")
    .optional()
    .isString().withMessage("Debe ser un string")
    .isIn(["pending", "confirmed","waiting","called", "noshow", "rescheduled","finalized", "canceled"]),
  query("limit")
    .optional()
    .isInt({min: 1}).withMessage("Limite invalido"),
  query("page")
    .optional()
    .isInt({min: 1}).withMessage("Limite invalido"),
  validate
]

export const validateAppointmentData= [
  body('date')
    .exists().withMessage('La fecha del turno es requerida')
    .notEmpty().withMessage('La fecha no puede estar vacía')
    .isDate({
      format: "YYYY-MM-DD",
      strictMode: true
    }).withMessage("La fecha debe tener formato  YYYY-MM-DD"),
  body('slots')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacio')
    .isArray({ min: 1 })
    .withMessage('Debe enviar al menos un slot')
    .custom((value) => {
      const unique = new Set(value);
      if (unique.size !== value.length) {
        throw new Error('No puede haber slots repetidos');
      }
      return true;
    }),
  body('slots.*')
    .isInt({ min: 0, max: 17 }).withMessage('Cada slot debe ser un número entre 0 y 17')
    .toInt(),
  body('typeAppointment')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isIn(["consulta", "cirugia", "control", "tratamiento"]).withMessage('El tipo debe ser "consulta", "cirugia", "control", "tratamiento"'),
  body('doctorID')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isMongoId().withMessage('ID Invalido'),
  body('patientID')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isMongoId().withMessage('ID Invalido'),
  body('status')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isIn(["pending", "confirmed", "noshow", "eescheduled","finalized", "canceled"]).withMessage('El status debe ser "pending", "confirmed", "noshow", "eescheduled","finalized", "canceled"'),

  validate //middleware
];

export const validateUpdateAppointment = [
  param('id').isMongoId().withMessage('ID Invalido'),
  ...validateAppointmentData
];

