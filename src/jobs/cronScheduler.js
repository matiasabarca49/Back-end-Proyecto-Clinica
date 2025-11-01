import cron from 'node-cron';
import { sendDailyAppointmentReminders } from './appointmentReminder.js';

/**
 * Inicializa todos los cron jobs del sistema
 */
export const initCronJobs = () => {
  console.log("⏰ Inicializando Cron Jobs...");
  
  // ========================================
  // OPCIÓN 1: Para PRODUCCIÓN (medianoche)
  // ========================================
   cron.schedule('0 0 * * *', async () => {
     console.log("\n⏰ CRON: Ejecutando recordatorio de turnos a las 00:00 hs");
     await sendDailyAppointmentReminders();
   }, {
     timezone: "America/Argentina/Buenos_Aires"
  });
  
  // ========================================
  // OPCIÓN 2: Para TESTING - Cada 2 minutos
  // ========================================
 // cron.schedule('*/2 * * * *', async () => {
   // console.log("\n⏰ CRON TEST: Ejecutando recordatorio cada 2 minutos");
   // await sendDailyAppointmentReminders();
 // }, {
  //  timezone: "America/Argentina/Buenos_Aires"
 // });
  
//  console.log("✅ Cron Job de recordatorios configurado (cada 2 minutos - MODO TEST)");
  
  // ========================================
  // OPCIÓN 3: Ejecución inmediata al iniciar
  // ========================================
 // console.log("🧪 Ejecutando recordatorio de prueba INMEDIATO...");
//  sendDailyAppointmentReminders();
};