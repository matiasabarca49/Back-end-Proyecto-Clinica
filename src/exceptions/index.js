/**
 * Archivo índice de excepciones
 * 
 * Este archivo exporta todas las excepciones en un solo lugar
 * para que sea más fácil importarlas
 */

import AppError from './AppErrors.js';

// Importar excepciones de validación
import {
  NotFoundError,
  ValidationError,
  DuplicateError
} from './validations.exception.js';

// Importar excepciones de autenticación
import {
  UnauthorizedError,
  ForbiddenError,
  InvalidCredentialsError
} from './auth.exception.js';


// Exportar todo junto
export {
  // Base
  AppError,
  
  // Validación
  NotFoundError,
  ValidationError,
  DuplicateError,
  
  // Autenticación
  UnauthorizedError,
  ForbiddenError,
  InvalidCredentialsError,
};

/**
 * CÓMO USAR ESTE ARCHIVO:
 * 
 * import {
 *   NotFoundError,
 *   ValidationError,
 *   AppointmentConflictError
 * } from  './exceptions';
 * 
 *
 */