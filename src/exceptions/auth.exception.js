/**
 * Excepciones de autenticación y autorización
 */

import AppError from './AppErrors.js';

/**
 * Error cuando el usuario no está autenticado (401)
 */
class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado. Debe iniciar sesión') {
    super(message, 401);
  }
}

/**
 * Error cuando el usuario no tiene permisos (403)
 */
class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para realizar esta acción') {
    super(message, 403);
  }
}

/**
 * Error de credenciales incorrectas (401)
 */
class InvalidCredentialsError extends AppError {
  constructor(message = 'credenciales incorrectas') {
    super(message, 401);
  }
}

export {
  UnauthorizedError,
  ForbiddenError,
  InvalidCredentialsError
};

/**
 * CÓMO USARLAS:
 * 
 * const { UnauthorizedError, ForbiddenError } = require('./exceptions/AuthExceptions');
 * 
 * // Ejemplo 1: No hay token
 * if (!token) {
 *   throw new UnauthorizedError();
 * }
 * 
 * // Ejemplo 2: Usuario no es admin
 * if (user.role !== 'admin') {
 *   throw new ForbiddenError('Solo administradores pueden eliminar pacientes');
 * }
 * 
 * // Ejemplo 3: Login fallido
 * if (!isValidPassword) {
 *   throw new InvalidCredentialsError();
 * }
 */