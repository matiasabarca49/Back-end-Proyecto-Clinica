import { Appointment } from "../model/mongo/appointment.model.js";
import { sendAppointmentReminder } from "../utils/email.helpers.js";
import { slotsToRanges } from "../utils/slots.helper.js";

/**
 * Función que envía recordatorios de turnos para el día actual
 * Se ejecuta todos los días a las 00:00 hs
 */
export const sendDailyAppointmentReminders = async () => {
  try {
    console.log("🔔 Iniciando envío de recordatorios de turnos...");
    
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
    
    console.log(`📅 Buscando turnos para: ${today.toLocaleDateString('es-AR')}`);
    console.log(`🕐 Rango UTC: ${todayStart.toISOString()} a ${todayEnd.toISOString()}`);
    
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
      console.log("ℹ️ No hay turnos para hoy");
      console.log("🔍 Query utilizada:", {
        date: {
          $gte: todayStart.toISOString(),
          $lte: todayEnd.toISOString()
        },
        status: { $in: ["Confirmed", "Pending"] }
      });
      return;
    }
    
    console.log(`📊 Se encontraron ${appointments.length} turno(s) para hoy`);
    
    // Enviar email a cada paciente
    let successCount = 0;
    let errorCount = 0;
    
    for (const appointment of appointments) {
      try {
        const patient = appointment.patientID;
        const doctor = appointment.doctorID;
        
        // Verificar que tengamos los datos necesarios
        if (!patient || !patient.email) {
          console.warn(`⚠️ Turno ${appointment._id}: paciente sin email`);
          errorCount++;
          continue;
        }
        
        if (!doctor) {
          console.warn(`⚠️ Turno ${appointment._id}: doctor no encontrado`);
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
          console.log(`  ✅ Recordatorio enviado a ${patient.email} (${patientFullName})`);
          successCount++;
        } else {
          console.warn(`  ❌ Error al enviar a ${patient.email}`);
          errorCount++;
        }
        
        // Pequeña pausa entre emails para no saturar el servidor SMTP
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (emailError) {
        console.error(`  ❌ Error procesando turno ${appointment._id}:`, emailError.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Recordatorios enviados: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log("🔔 Proceso de recordatorios finalizado\n");
    
  } catch (error) {
    console.error("❌ Error general en sendDailyAppointmentReminders:", error);
  }
};