/**
 * Esta clase extiende Error de JavaScript y añade:
 * - statusCode: código HTTP (404, 500, etc.)
 * - errorCode: identificador único del error
 * - isOperational: indica si es un error esperado
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Llama al constructor de Error
    
    this.statusCode = statusCode;
    this.isOperational = true; // true = error esperado/manejable
    
    // Captura el stack trace para debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

/**
 * CÓMO USARLA:
 * 
 * import AppError from './AppError';
 * 
 * throw new AppError('Algo salió mal', 400);
 */