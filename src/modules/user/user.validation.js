import { body, param } from 'express-validator';
import validate from '../../middlewares/validations.middleware.js';
import { doctorFieldsCreateRules, doctorFieldsUpdateRules } from '../doctor/index.js';

// Condición para las reglas de doctor en el alta: el rol viene en el mismo body
const isDoctorRol = (value, { req }) =>
  typeof req.body?.rol === 'string' && req.body.rol.trim().toLowerCase() === 'doctor';

export const validateUserData= [
  body('name')
    .exists().withMessage('El nombre es requerido')
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isString().withMessage('El nombre debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras y espacios')
    .trim()  // Elimina espacios antes y después
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .toLowerCase(),// Todo a minúsculas: "JuAN" -> "juan",
  body('lastName')
    .exists().withMessage('El apellido es requerido')
    .notEmpty().withMessage('El apellido no puede estar vacío')
    .isString().withMessage('El apellido debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo debe contener letras y espacios')
    .trim() 
    .isLength({ min: 3, max: 50 }).withMessage('El apellido debe tener entre 3 y 50 caracteres')
    .toLowerCase(),
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .isStrongPassword().withMessage('La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un símbolo'),
  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['doctor', 'employee', 'admin']).withMessage('El rol debe ser user, employee o admin'),
  // Datos profesionales: obligatorios solo si el rol es doctor; para otros roles se saltean
  ...doctorFieldsCreateRules(isDoctorRol),

  validate //middleware
];

// Todos opcionales: si el campo viene, se valida su formato
export const validateUpdateUser = [
  param('id').isMongoId().withMessage('ID Invalido'),
  body('name')
    .optional()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isString().withMessage('El nombre debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras y espacios')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  body('lastName')
    .optional()
    .notEmpty().withMessage('El apellido no puede estar vacío')
    .isString().withMessage('El apellido debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo debe contener letras y espacios')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El apellido debe tener entre 3 y 50 caracteres'),
  body('email')
    .optional()
    .isString().withMessage('Email Invalido')
    .bail()
    .isEmail().withMessage('Email Invalido'),
  body('rol')
    .optional()
    .isString().withMessage('El rol debe ser doctor, employee o admin')
    .bail()
    .trim()
    .toLowerCase() // Acepta "Doctor" o "DOCTOR"
    .isIn(['doctor', 'employee', 'admin']).withMessage('El rol debe ser doctor, employee o admin'),
  // Datos profesionales: solo se guardan si el usuario es doctor
  ...doctorFieldsUpdateRules,
  validate
];

