import { body, param } from 'express-validator';
import validate from '../middlewares/validations.middleware.js';

const validatePatients= [
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
  body('dni')
    .exists().withMessage('El dni es requerido')
    .notEmpty().withMessage('El dni no puede estar vacío')
    .isLength({ min: 7, max: 8 }).withMessage('El dni debe tener entre 7 y 8 caracteres'),
  body('birth')
    .exists().withMessage('La fecha de nacimiento es requerida')
    .notEmpty().withMessage('La fecha de nacimiento no puede estar vacía')
    .isDate().withMessage('Debe ser una fecha válida'),
  body('phone')
    .exists().withMessage('El teléfono es requerido')
    .notEmpty().withMessage('El teléfono no puede estar vacío')
    .isLength({ min: 9, max: 15 }).withMessage('El teléfono debe tener entre 9 y 15 caracteres'),
  body('address')
    .exists().withMessage('La dirección es requerida')
    .notEmpty().withMessage('La dirección no puede estar vacía')
    .isString().withMessage('La dirección debe ser un texto')
    .isLength({ min: 5, max: 100 }).withMessage('La dirección debe tener entre 5 y 100 caracteres'),
  body('medicalCoverage')
    .exists().withMessage('La cobertura médica es requerida')
    .notEmpty().withMessage('La cobertura médica no puede estar vacía')
    .isString().withMessage('La cobertura médica debe ser un texto')
    .isLength({ min: 3, max: 50 }).withMessage('La cobertura médica debe tener entre 3 y 50 caracteres'),
  body('nAffiliate')
    .exists().withMessage('El número de afiliado es requerido')
    .notEmpty().withMessage('El número de afiliado no puede estar vacío')
    .isString().withMessage('El número de afiliado debe ser un texto')
    .isLength({ min: 3, max: 50 }).withMessage('El número de afiliado debe tener entre 3 y 50 caracteres'),
  body('sex')
    .exists().withMessage('El sexo es requerido')
    .notEmpty().withMessage('El sexo no puede estar vacío')
    .isIn(["male", "female", "other"]).withMessage('El sexo debe ser "male", "female" u "other"'),
];

//Validaciones para tratamientos
const validateTreatment = [
  body('name')
    .exists().withMessage('El nombre del tratamiento es requerido')
    .notEmpty().withMessage('El nombre del tratamiento no puede estar vacío')
    .isString().withMessage('El nombre del tratamiento debe ser un texto')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre del tratamiento debe tener entre 3 y 50 caracteres'),
  body('dateStart')
    .exists().withMessage('La fecha de inicio del tratamiento es requerida')
    .notEmpty().withMessage('La fecha de inicio del tratamiento no puede estar vacía')
    .isDate().withMessage('La fecha de inicio del tratamiento debe ser una fecha válida'),
  body('dateEnd')
    .exists().withMessage('La fecha de fin del tratamiento es requerida')
    .notEmpty().withMessage('La fecha de fin del tratamiento no puede estar vacía')
    .isDate().withMessage('La fecha de fin del tratamiento debe ser una fecha válida'),
  body('status')
    .exists().withMessage('El estado del tratamiento es requerido')
    .notEmpty().withMessage('El estado del tratamiento no puede estar vacío')
    .isIn(["progress","pending", "finalized", "canceled"]).withMessage('El estado del tratamiento debe ser "progress", "pending", "finalized" o "canceled"'),
]

const validateObservations = [
  body('status')
    .exists().withMessage('El estado de la observación es requerido')
    .notEmpty().withMessage('El estado de la observación no puede estar vacío')
    .isIn(["pending", "finalized", "canceled"]).withMessage('El estado de la observación debe ser "pending", "finalized" o "canceled"'),
  body('name')
    .exists().withMessage('El texto de la observación es requerido')
    .notEmpty().withMessage('El texto de la observación no puede estar vacío')
    .isString().withMessage('El texto de la observación debe ser un texto')
    .isLength({ min: 3, max: 200 }).withMessage('El texto de la observación debe tener entre 3 y 200 caracteres'),
  body('date')
    .optional()
    .isDate().withMessage('La fecha de la observación debe ser una fecha válida'),     
]

//Validaciones para estado dental  
const validateDentalStatus = [
  body('tooth')
    .exists().withMessage('El número de diente es requerido')
    .notEmpty().withMessage('El número de diente no puede estar vacío')
    .isInt().withMessage('El diente debe ser un número')
    .custom((value) => {
      const tooths = new Set([
        18, 17, 16, 15, 14, 13, 12, 11, 48, 47, 46, 45, 44, 43, 42, 41,
        21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38,
        55, 54, 53, 52, 51, 85, 84, 83, 82, 81,
        61, 62, 63, 64, 65, 71, 72, 73, 74, 75
      ])
      if (!tooths.has(value)) {
        throw new Error('Número de diente inválido según sistema FDI');
      }
      return true;
    }),
  body('caries')
        .exists().withMessage('El estado del diente es requerido')
        .notEmpty().withMessage('El estado del diente no puede estar vacío')
        .isObject().withMessage('Cada estado dental debe ser un objeto'),
  body('caries.vestibular')
        .exists().withMessage('El estado de la cara vestibular es requerido')
        .notEmpty().withMessage('El estado de la cara vestibular no puede estar vacío')
        .isString().withMessage('El estado de la cara vestibular debe ser un texto')
        .isIn(["0", "1", "2"]).withMessage('El estado de la cara vestibular debe ser "0" , "1", "2"'),
  body('caries.lingual')
        .exists().withMessage('El estado de la cara lingual es requerido')
        .notEmpty().withMessage('El estado de la cara lingual no puede estar vacío')
        .isString().withMessage('El estado de la cara lingual debe ser un texto')
        .isIn(["0", "1", "2"]).withMessage('El estado de la cara lingual debe ser "0" , "1", "2"'),
  body('caries.mesial')
        .exists().withMessage('El estado de la cara mesial es requerido')
        .notEmpty().withMessage('El estado de la cara mesial no puede estar vacío')
        .isString().withMessage('El estado de la cara mesial debe ser un texto')
        .isIn(["0", "1", "2"]).withMessage('El estado de la cara mesial debe ser "0" , "1", "2"'),
  body('caries.distal')
        .exists().withMessage('El estado de la cara distal es requerido')
        .notEmpty().withMessage('El estado de la cara distal no puede estar vacío')
        .isString().withMessage('El estado de la cara distal debe ser un texto')
        .isIn(["0", "1", "2"]).withMessage('El estado de la cara distal debe ser "0" , "1", "2"'),
  body('caries.oclusal')
        .exists().withMessage('El estado de la cara oclusal es requerido')
        .notEmpty().withMessage('El estado de la cara oclusal no puede estar vacío')
        .isString().withMessage('El estado de la cara oclusal debe ser un texto')
        .isIn(["0", "1", "2"]).withMessage('El estado de la cara oclusal debe ser "0" , "1", "2"'),
  body('corona')
        .exists().withMessage('El estado de la corona es requerido')
        .notEmpty().withMessage('El estado de la corona no puede estar vacío')
        .isBoolean().withMessage('El estado de la corona debe ser un booleano'),
  body('extracted')
        .exists().withMessage('El estado de la extracción es requerido')
        .notEmpty().withMessage('El estado de la extracción no puede estar vacío')
        .isBoolean().withMessage('El estado de la extracción debe ser un booleano'),
  body('allcaries')
        .exists().withMessage('El estado de las caries es requerido')
        .notEmpty().withMessage('El estado de las caries no puede estar vacío')
        .isBoolean().withMessage('El estado de las caries debe ser un booleano'),
  body('incurable')
        .exists().withMessage('El estado de las caries es requerido')
        .notEmpty().withMessage('El estado de las caries no puede estar vacío')
        .isBoolean().withMessage('El estado de las caries debe ser un booleano'),
  body('malposition')
        .exists().withMessage('El estado de la malposición es requerido')
        .notEmpty().withMessage('El estado de la malposición no puede estar vacío')
        .isBoolean().withMessage('El estado de la malposición debe ser un booleano'),
  body('periodontal')
        .exists().withMessage('El estado de la periodontal es requerido')
        .notEmpty().withMessage('El estado de la periodontal no puede estar vacío')
        .isBoolean().withMessage('El estado de la periodontal debe ser un booleano'),
  body('inscrustration')
        .exists().withMessage('El estado de la inscrustración es requerido')
        .notEmpty().withMessage('El estado de la inscrustración no puede estar vacío')
        .isBoolean().withMessage('El estado de la inscrustración debe ser un booleano'),
]

export const validateCreatePatient = [
    ...validatePatients,
    
    body('idDoctor')
    .exists().withMessage('El ID del doctor es requerido')
    .notEmpty().withMessage('El ID del doctor no puede estar vacío')
    .isMongoId().withMessage('El ID del doctor debe ser un ID de MongoDB válido'),
    
    validate
]


export const validateUpdatePatient = [
  param('id')
        .exists().withMessage('El ID del paciente es requerido')
        .notEmpty().withMessage('El ID del paciente no puede estar vacío')
        .isMongoId().withMessage('El ID del paciente debe ser un ID de MongoDB válido'),

  ...validatePatients, // Reutiliza las validaciones de creación

  validate
];

export const validateAddTreatment = [
  param('id')
        .exists().withMessage('El ID del paciente es requerido')
        .notEmpty().withMessage('El ID del paciente no puede estar vacío')
        .isMongoId().withMessage('El ID del paciente debe ser un ID de MongoDB válido'),

  ...validateTreatment, // Reutiliza las validaciones de tratamientos

  validate
]

export const validateAddTooth = [
  param('patientId')
        .exists().withMessage('El ID del paciente es requerido')
        .notEmpty().withMessage('El ID del paciente no puede estar vacío')
        .isMongoId().withMessage('El ID del paciente debe ser un ID de MongoDB válido'),
  param('toothId')
        .exists().withMessage('El ID del diente es requerido')
        .notEmpty().withMessage('El ID del diente no puede estar vacío')
        .custom((value) => {
          const tooths = new Set([
            18, 17, 16, 15, 14, 13, 12, 11, 48, 47, 46, 45, 44, 43, 42, 41,
            21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38,
            55, 54, 53, 52, 51, 85, 84, 83, 82, 81,
            61, 62, 63, 64, 65, 71, 72, 73, 74, 75
          ])
          if (!tooths.has(parseInt(value))) {
            throw new Error('Número de diente inválido según sistema FDI');
          }
          return true;
        }),
  
  ...validateDentalStatus, // Reutiliza las validaciones de estado dental

  validate
] 

export const validateAddObservation = [
  param('id')
        .exists().withMessage('El ID del paciente es requerido')
        .notEmpty().withMessage('El ID del paciente no puede estar vacío')
        .isMongoId().withMessage('El ID del paciente debe ser un ID de MongoDB válido'),

  ...validateObservations, 

  validate
]

