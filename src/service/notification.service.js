export default class NotificationService {
  /**
   * Notifica al doctor correspondiente que un paciente pasó a estado "waiting".
   * TODO: Implementar la emisión real vía Socket Provider (room: doctor:<doctorId>, evento: appointment.waiting)
   * @param {Object} appointment - El turno actualizado (ya en formato DTO)
   */
  async notifyAppointmentWaiting(appointment) {
    // Stub temporal: todavía no implementado por el equipo de sockets
    console.log(
      `ℹ️ [NotificationService] Pendiente de implementar: notificar al doctor ${appointment.doctorID} sobre turno en espera.`,
    );
  }
}