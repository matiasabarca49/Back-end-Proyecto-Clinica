import { Appointment } from "./appointment.model.js";
import { sendAppointmentReminder } from "../../utils/email.helpers.js";
import { slotsToRanges } from "../../utils/slots.helper.js";
import logger from "../../core/logger/logger.js";

/**
 * Función que envía recordatorios de turnos para el día actual
 * Se ejecuta todos los días a las 00:00 hs
 */
export const sendDailyAppointmentReminders = async () => {
  try {
    logger.info("Iniciando envío de recordatorios de turnos...");
    
    // ========================================
    // CREAR FECHAS EN UTC (como están en la DB)
    // ========================================
    const today = new Date();
    
    // Obtener fecha local de Argentina pero crear Date en UTC
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    
    // Crear rango UTC para "hoy" (00:00 a 23:59:59 UTC del día actual)
    const todayStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    
    logger.info(`Buscando turnos para: ${today.toLocaleDateString('es-AR')}`);
    logger.info(`Rango UTC: ${todayStart.toISOString()} a ${todayEnd.toISOString()}`);
    
    // Buscar todos los turnos confirmados de hoy usando Mongoose directamente
    // Necesitamos populate para obtener datos del paciente y doctor
    const appointments = await Appointment.find({
      date: {
        $gte: todayStart,
        $lte: todayEnd
      },
      status: { $in: ["Confirmed", "Pending"] }
    })
    .populate('patientID')  // Traer datos del paciente
    .populate('doctorID')   // Traer datos del doctor
    .lean();  // Convertir a objeto plano de JS para mejor performance
    
    if (!appointments || appointments.length === 0) {
      logger.info("No hay turnos para hoy");
      return;
    }
    
    logger.info(`Se encontraron ${appointments.length} turno(s) para hoy`);
    
    // Enviar email a cada paciente
    let successCount = 0;
    let errorCount = 0;
    
    for (const appointment of appointments) {
      try {
        const patient = appointment.patientID;
        const doctor = appointment.doctorID;
        
        // Verificar que tengamos los datos necesarios
        if (!patient || !patient.email) {
          logger.error(`Turno ${appointment._id}: paciente sin email`);
          errorCount++;
          continue;
        }
        
        if (!doctor) {
          logger.info(`⚠️ Turno ${appointment._id}: doctor no encontrado`);
          errorCount++;
          continue;
        }
        
        // Formatear datos
        const patientFullName = `${patient.name} ${patient.lastName}`;
        const doctorFullName = `Dr. ${doctor.name} ${doctor.lastName}`;
        
        const timeRanges = slotsToRanges(appointment.slots, "09:00", 30);
        const appointmentTime = timeRanges.join(", ") || "Horario no especificado";
        
        // Traducir tipo de cita
        const typeTranslations = {
          consulta: "Consulta",
          cirugia: "Cirugía",
          control: "Control",
          tratamiento: "Tratamiento"
        };
        const typeInSpanish = typeTranslations[appointment.typeAppointment] || appointment.typeAppointment;
        
        // Enviar email
        const emailSent = await sendAppointmentReminder(
          patient.email,
          patientFullName,
          doctorFullName,
          appointment.date,
          appointmentTime,
          appointment.room,
          typeInSpanish
        );
        
        if (emailSent) {
          successCount++;
        } else {
          logger.error(` Error al enviar a ${patient.email}`);
          errorCount++;
        }
        
        // Pequeña pausa entre emails para no saturar el servidor SMTP
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (err) {
        logger.error({
            message: `Error procesando turno ${appointment._id}`,
            error: err.message,
            stack: err.stack
        });
        errorCount++;
      }
    }
    
    logger.info(`Recordatorios enviados: ${successCount}`);
    logger.info(`Errores: ${errorCount}`);
    logger.info("Proceso de recordatorios finalizado\n");
    
  } catch (err) {
    logger.error({
      message: "Error al enviar confirmacion de turnos",
      error: err.message,
      stack: err.stack
    });
  }
};