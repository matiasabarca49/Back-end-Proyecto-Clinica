import cron from 'node-cron';
import { sendDailyAppointmentReminders } from '../../modules/appointment/appointment.jobs.js';
import logger from '../logger/logger.js';

/**
 * Inicializa todos los cron jobs del sistema
 */
export const initCronJobs = () => {
  logger.info("Cron Jobs inicializados");
  
  // ========================================
  // OPCIÓN 1: Para PRODUCCIÓN (medianoche)
  // ========================================
   cron.schedule('0 0 * * *', async () => {
     logger.info("CRON: Ejecutando recordatorio de turnos a las 00:00 hs");
     await sendDailyAppointmentReminders();
   }, {
     timezone: "America/Argentina/Buenos_Aires"
  });
};