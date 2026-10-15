import { body } from 'express-validator';
import { CARIES_FACES, TOOTH_FLAGS } from '../schemas/tooth.schema.js';

// Números de dientes válidos según el sistema FDI (permanentes y temporales)
const FDI_TEETH = new Set([
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
  55, 54, 53, 52, 51, 61, 62, 63, 64, 65,
  85, 84, 83, 82, 81, 71, 72, 73, 74, 75
]);

const CARIES_VALUES = ['0', '1', '2'];

/**
 * Reglas para un diente completo en el body, según toothSchema (shared/schemas/tooth.schema.js).
 * No incluye el middleware `validate`: cada feature lo agrega al final de su cadena.
 */
export const validateToothBody = [
  body('tooth')
    .exists().withMessage('El número de diente es requerido')
    .isInt().withMessage('El diente debe ser un número entero')
    .toInt()
    .custom((value) => {
      if (!FDI_TEETH.has(value)) throw new Error('Número de diente inválido según sistema FDI');
      return true;
    }),
  body('caries')
    .exists().withMessage('El estado de caries es requerido')
    .isObject().withMessage('caries debe ser un objeto'),
  ...CARIES_FACES.map((face) =>
    body(`caries.${face}`)
      .exists().withMessage(`El estado de la cara ${face} es requerido`)
      .isIn(CARIES_VALUES).withMessage(`El estado de la cara ${face} debe ser "0", "1" o "2"`)
  ),
  ...TOOTH_FLAGS.map((flag) =>
    body(flag)
      .exists().withMessage(`${flag} es requerido`)
      .isBoolean({ strict: true }).withMessage(`${flag} debe ser booleano`)
  )
];
