import { body, param, query } from 'express-validator';
import validate from '../../middlewares/validations.middleware.js';
import { validateToothBody } from '../../shared/validations/tooth.validation.js';

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

// Consultorio: se usa al crear, editar y en el check-in. Puede vaciarse con ""
const roomRule = body('room')
  .optional()
  .isString().withMessage('El consultorio debe ser un texto')
  .bail()
  .isLength({ max: 50 }).withMessage('El consultorio no puede superar los 50 caracteres');

// Campos del turno que se validan igual al crear y al actualizar
const appointmentFields = [
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
  // Minuto del día en que empieza cada slot. Que caigan en el horario del doctor y sean consecutivos
  // se controla en el service, porque depende del doctor y de la fecha
  body('slots.*')
    .isInt({ min: 0, max: 1439 }).withMessage('Cada slot debe ser un minuto del día entre 0 y 1439')
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
  roomRule,
  body('observations')
    .optional()
    .isString().withMessage('Las observaciones deben ser un texto')
    .bail()
    .isLength({ max: 500 }).withMessage('Las observaciones no pueden superar los 500 caracteres'),
];

export const validateAppointmentData = [
  ...appointmentFields,
  // Un turno nace pendiente o confirmado: los demás estados se alcanzan con su propio flujo
  // (check-in, call, finalize, status), así nadie crea un turno ya atendido o cancelado
  body('status')
    .exists().withMessage('Atributo requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isIn(["pending", "confirmed"]).withMessage('Un turno nuevo debe tener status "pending" o "confirmed"'),

  validate //middleware
];

// Sin status: el estado se cambia con sus propios endpoints (check-in, call, finalize, status)
export const validateUpdateAppointment = [
  param('id').isMongoId().withMessage('ID Invalido'),
  ...appointmentFields,
  validate //middleware
];


export const validateChangeStatusAppointment = [
  body("status")
  .exists()
  .notEmpty()
  .isString()
  .isIn(["confirmed", "noshow", "rescheduled", "canceled"]).withMessage("El estado debe ser confirmed, noshow, rescheduled o canceled"),
  validate //middleware
];


export const validateGetAvailable = [
  param('id').isMongoId().withMessage('ID Invalido'),
  query('day')
    .exists().withMessage('La fecha es requerida')
    // Un parámetro repetido llega como array y pasaría las reglas de abajo elemento por elemento
    .isString().withMessage('Debe enviarse una sola vez').bail()
    .isDate({ format: "YYYY-MM-DD", strictMode: true }).withMessage("La fecha debe tener formato YYYY-MM-DD"),
  validate //middleware
];

// Días máximos que puede abarcar /availability: alcanza para la grilla de un mes del calendario y acota la consulta
const AVAILABILITY_MAX_DAYS = 62;

export const validateGetAvailability = [
  query('doctor')
    .exists().withMessage('El doctor es requerido')
    // Un parámetro repetido llega como array y pasaría las reglas de abajo elemento por elemento
    .isString().withMessage('Debe enviarse una sola vez').bail()
    .isMongoId().withMessage('ID Invalido'),
  query('from')
    .exists().withMessage('La fecha inicial es requerida')
    .isString().withMessage('Debe enviarse una sola vez').bail()
    .isDate({ format: "YYYY-MM-DD", strictMode: true }).withMessage("La fecha debe tener formato YYYY-MM-DD"),
  query('to')
    .exists().withMessage('La fecha final es requerida')
    .isString().withMessage('Debe enviarse una sola vez').bail()
    .isDate({ format: "YYYY-MM-DD", strictMode: true }).withMessage("La fecha debe tener formato YYYY-MM-DD")
    .bail()
    .custom((to, { req }) => {
      const days = (new Date(`${to}T00:00:00Z`) - new Date(`${req.query.from}T00:00:00Z`)) / 86_400_000 + 1;
      // Si from es inválida, ya lo informa su propia regla
      if (Number.isNaN(days)) return true;
      if (days < 1) throw new Error('La fecha final debe ser igual o posterior a la inicial');
      if (days > AVAILABILITY_MAX_DAYS) throw new Error(`El rango no puede superar los ${AVAILABILITY_MAX_DAYS} días`);
      return true;
    }),
  validate //middleware
];

export const validateCheckIn = [
  param('id').isMongoId().withMessage('ID Invalido'),
  roomRule,
  validate //middleware
];

export const validateGetNearest = [
  param('id').isMongoId().withMessage('ID Invalido'),
  validate //middleware
];

export const validateGetOdontogram = [
  param('id').isMongoId().withMessage('ID Invalido'),
  validate //middleware
];

export const validateUpsertTooth = [
  param('id').isMongoId().withMessage('ID Invalido'),
  ...validateToothBody,
  validate //middleware
];
