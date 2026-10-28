import { body, param } from 'express-validator';
import validate from '../../middlewares/validations.middleware.js';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // Formato H:MM o HH:MM

// Condición por defecto de las reglas: aplican siempre
const always = () => true;

// Si un día viene, debe ser un objeto con inicio y fin válidos (si no es objeto, solo se informa ese error)
const validateScheduleDay = (day, when) => [
  body(`schedules.${day}`)
    .if(when)
    .optional()
    .isObject({ strict: true }).withMessage(`El horario del ${day} debe ser un objeto con inicio y fin`),
  body(`schedules.${day}.start`)
    .if(when)
    .if(body(`schedules.${day}`).isObject({ strict: true }))
    .isString().withMessage(`El horario de inicio del ${day} debe tener formato H:MM o HH:MM`)
    .bail()
    .matches(timeRegex).withMessage(`El horario de inicio del ${day} debe tener formato H:MM o HH:MM`),
  body(`schedules.${day}.end`)
    .if(when)
    .if(body(`schedules.${day}`).isObject({ strict: true }))
    .isString().withMessage(`El horario de fin del ${day} debe tener formato H:MM o HH:MM`)
    .bail()
    .matches(timeRegex).withMessage(`El horario de fin del ${day} debe tener formato H:MM o HH:MM`)
    .bail()
    .custom((end, { req }) => {
      const start = req.body?.schedules?.[day]?.start;
      // Si el inicio es inválido, ya lo informa su propia regla
      if (typeof start === 'string' && timeRegex.test(start)) {
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

// Si viene schedules, es la semana completa (los 6 días) y reemplaza a la anterior.
// Se exigen todos los días para que alta y edición se comporten igual: en el alta Mongoose
// completaría los días faltantes con el horario por defecto, y en la edición quedarían vacíos
const scheduleRules = (when = always) => [
  body('schedules')
    .if(when)
    .optional()
    .isObject({ strict: true }).withMessage('Los horarios deben ser un objeto con los días de la semana')
    .bail()
    .custom((schedules) => {
      const unknownDays = Object.keys(schedules).filter(day => !DAYS_OF_WEEK.includes(day));
      if (unknownDays.length > 0) {
        throw new Error(`Días inválidos en los horarios: ${unknownDays.join(', ')}`);
      }
      const missingDays = DAYS_OF_WEEK.filter(day => !(day in schedules));
      if (missingDays.length > 0) {
        throw new Error(`Faltan días en los horarios: ${missingDays.join(', ')}`);
      }
      return true;
    }),
  ...DAYS_OF_WEEK.flatMap(day => validateScheduleDay(day, when)),
];

// Duración del turno en minutos
const FREQUENCY_RANGE = { min: 5, max: 240 };
const FREQUENCY_MESSAGE = 'La frecuencia debe ser un número entero entre 5 y 240 minutos';

const frequencyRule = body('frequency')
  .optional()
  .isInt(FREQUENCY_RANGE).withMessage(FREQUENCY_MESSAGE);

/**
 * Reglas de los datos profesionales para dar de alta un doctor desde POST /users.
 * Son obligatorios los mismos campos que exige UsersService.create; schedules es opcional
 * (si no viene, se usan los horarios por defecto).
 * @param {Function} when Condición (value, { req }) => boolean. Si da false, el validador saltea
 *                        todas las reglas: así un usuario que no es doctor no recibe errores por estos campos.
 */
export const doctorFieldsCreateRules = (when) => [
  body('dni')
    .if(when)
    .exists().withMessage('El DNI es requerido para un doctor')
    .bail()
    .isString().withMessage('Debe ser un texto')
    .bail()
    .notEmpty().withMessage('No puede estar vacío'),
  body('phone')
    .if(when)
    .exists().withMessage('El teléfono es requerido para un doctor')
    .bail()
    .isString().withMessage('Debe ser un texto')
    .bail()
    .notEmpty().withMessage('No puede estar vacío'),
  body('professionalLicense')
    .if(when)
    .exists().withMessage('La matrícula profesional es requerida para un doctor')
    .bail()
    .isString().withMessage('Debe ser un texto')
    .bail()
    .notEmpty().withMessage('No puede estar vacío'),
  body('color')
    .if(when)
    .exists().withMessage('El color es requerido para un doctor')
    .bail()
    .isHexColor().withMessage('El color debe ser un valor hexadecimal válido (ej: #8f897fff)'),
  body('frequency')
    .if(when)
    .exists().withMessage('La frecuencia es requerida para un doctor')
    .bail()
    .isInt(FREQUENCY_RANGE).withMessage(FREQUENCY_MESSAGE),
  ...scheduleRules(when),
];

/**
 * Reglas de los datos profesionales del doctor para actualizar.
 * Todos opcionales: si el campo viene, se valida su formato.
 * Las usa también PUT /users/:id, que edita doctores desde la cuenta de usuario.
 */
export const doctorFieldsUpdateRules = [
  body('dni')
    .optional()
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto'),
  body('phone')
    .optional()
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto'),
  body('professionalLicense')
    .optional()
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto'),
  body('color')
    .optional()
    .isHexColor().withMessage('El color debe ser un valor hexadecimal válido (ej: #8f897fff)'),
  frequencyRule,
  ...scheduleRules(),
];

// Nombre, apellido y email no se editan por aquí: son datos de la cuenta y se editan por PUT /users/:id
export const validateUpdateDoctor = [
  param('id').isMongoId().withMessage('ID Inválido'),
  ...doctorFieldsUpdateRules,
  validate // middleware
];