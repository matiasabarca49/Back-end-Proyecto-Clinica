import AppError from './AppErrors.js';

/**
 * Error cuando el servicio no está disponible (500)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Servicio no disponible') {
    super(message, 500);
  }
}