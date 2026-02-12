/**
 * Middleware de manejo de errores
 * 
 * Este middleware:
 * 1. Captura todos los errores de la app
 * 2. Los convierte en respuestas JSON
 * 3. Maneja errores operacionales vs errores de sistema
 */

import AppError from '../exceptions/AppErrors.js';

/**
 * Middleware principal de errores
 * IMPORTANTE: Debe tener exactamente 4 parámetros (err, req, res, next)
 */

const errorHandler = (err, req, res, next) => {
  
  //Log del error para debugging
  console.error('❌ Error capturado:', {
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method
  });

  //Si es un error operacional (AppError), responder con su info
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode
      }
    });
  }

  //Si es un error desconocido/del sistema
  const statusCode = err.statusCode || 500;
  const message = 'Error interno del servidor' 
    

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode
    }
  });
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.originalUrl}`,
    404
  );
  next(error); // Pasa el error al errorHandler
};

export {
  errorHandler,
  notFoundHandler
};

