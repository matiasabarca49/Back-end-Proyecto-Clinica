import { body, param } from 'express-validator';
import validate from '../middlewares/validations.middleware.js';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const timeRegex = /^([0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/; // Formato H:MM o HH:MM

const validateScheduleDay = (day) => [
  body(`schedules.${day}.start`)
    .optional()
    .matches(timeRegex).withMessage(`El horario de inicio del ${day} debe tener formato H:MM o HH:MM`),
  body(`schedules.${day}.end`)
    .optional()
    .matches(timeRegex).withMessage(`El horario de fin del ${day} debe tener formato H:MM o HH:MM`)
    .custom((end, { req }) => {
      const start = req.body?.schedules?.[day]?.start;
      if (start && end) {
        const toMinutes = (t) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };
        if (toMinutes(end) <= toMinutes(start)) {
          throw new Error(`El horario de fin del ${day} debe ser posterior al de inicio`);
        }
      }
      return true;
    }),
];

export const validateDoctorData = [
  body('_id')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isMongoId().withMessage('ID Inválido'),
  body('name')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto')
    .trim(),
  body('lastName')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto')
    .trim(),
  body('dni')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto'),
  body('phone')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto'),
  body('email')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('professionalLicense')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto'),
  body('status')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isIn(['active', 'inactive']).withMessage('El status debe ser "active" o "inactive"'),
  body('color')
    .optional()
    .isHexColor().withMessage('El color debe ser un valor hexadecimal válido (ej: #8f897fff)'),

  // Schedules: se valida cada día
  ...DAYS_OF_WEEK.flatMap(validateScheduleDay),

  validate // middleware
];

export const validateUpdateDoctor = [
  param('id').isMongoId().withMessage('ID Inválido'),
  ...validateDoctorData
];