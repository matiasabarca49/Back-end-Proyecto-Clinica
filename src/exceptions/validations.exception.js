/**
 * Excepciones específicas de validación
 * 
 * Estas excepciones heredan de AppError y ya tienen
 * configurado el statusCode apropiado
 */

import AppError from './AppErrors.js';

/**
 * Error cuando un recurso no se encuentra (404)
 */
class NotFoundError extends AppError {
  constructor(recurso = 'Recurso', id = null) {
    const message = id 
      ? `${recurso} con ID ${id} no encontrado`
      : `${recurso} no encontrado`;
    
    super(message, 404);
  }
}

/**
 * Error de validación de datos (400)
 */
class ValidationError extends AppError {
  constructor(message = 'Error de validación') {
    super(message, 400);
  }
}

/**
 * Error cuando algo ya existe/está duplicado (409)
 */
class DuplicateError extends AppError {
  constructor(campo, valor) {
    super(`El ${campo} '${valor}' ya está registrado`, 409);
  }
}

export {
  NotFoundError,
  ValidationError,
  DuplicateError
};

/**
 * CÓMO USARLAS:
 * 
 * const { NotFoundError, ValidationError, DuplicateError } = require('./exceptions/ValidationExceptions');
 * 
 * // Ejemplo 1: Paciente no encontrado
 * const patient = await Patient.findById(id);
 * if (!patient) {
 *   throw new NotFoundError('Paciente', id);
 * }
 * 
 * // Ejemplo 2: Email ya existe
 * const exists = await Patient.findOne({ email });
 * if (exists) {
 *   throw new DuplicateError('email', email);
 * }
 * 
 * // Ejemplo 3: Campos faltantes
 * if (!nombre || !email) {
 *   throw new ValidationError('Nombre y email son requeridos');
 * }
 */