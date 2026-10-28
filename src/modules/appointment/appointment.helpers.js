// Horarios de los turnos
//
// Cada slot es el minuto del día en que empieza (14:00 → 840). Así un turno guardado no cambia
// de hora aunque después cambien el horario o la frecuencia del médico.

// Ordenados según getUTCDay(). El domingo no tiene horario en el modelo del médico: no se atiende
const WEEK_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const pad = (num) => num.toString().padStart(2, "0");

// "9:00" o "09:00" → 540
const toMinutes = (hour) => {
  const [h, m] = hour.split(":").map(Number);
  return h * 60 + m;
};

// 540 → "09:00"
const toHour = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/**
 * Horario del médico para una fecha
 * @param {Object} schedules Horarios del médico por día de la semana
 * @param {String} date Fecha YYYY-MM-DD
 * @returns {Object|null} { start, end } del día, o null si ese día no atiende
 */
export const getDaySchedule = (schedules, date) => {
  // En UTC: date no tiene zona horaria y el día de la semana no debe depender de la del servidor
  const weekDay = WEEK_DAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  return schedules?.[weekDay] ?? null;
};

/**
 * Sumar días a una fecha
 * @param {String} date Fecha YYYY-MM-DD
 * @param {Number} days Días a sumar
 * @returns {String} Fecha YYYY-MM-DD
 */
export const addDays = (date, days) => {
  // En UTC para que el cambio de horario o la zona del servidor no salteen ni repitan días
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().split("T")[0];
};

/**
 * Slots de un día: desde el inicio del horario, de a una frecuencia, sin pasarse del cierre
 * @param {Object} schedule Horario del día { start, end }, formato H:MM o HH:MM
 * @param {Number} frequency Duración de cada slot en minutos
 * @returns {Number[]} Minuto del día en que empieza cada slot
 */
export const getDaySlots = (schedule, frequency) => {
  const slots = [];
  const end = toMinutes(schedule.end);
  for (let slot = toMinutes(schedule.start); slot + frequency <= end; slot += frequency) {
    slots.push(slot);
  }
  return slots;
};

/**
 * Saber si un turno se superpone con un rango horario
 *
 * Compara rangos y no slots iguales: un turno reservado con otra duración (antes de un cambio de
 * frecuencia del doctor) puede superponerse sin empezar a la misma hora.
 *
 * @param {Object} appointment Turno { slots, duration }
 * @param {Number} start Minuto del día en que empieza el rango
 * @param {Number} end Minuto del día en que termina el rango (no incluido)
 * @returns {Boolean}
 */
export const appointmentOverlaps = (appointment, start, end) =>
  Math.min(...appointment.slots) < end && start < Math.max(...appointment.slots) + appointment.duration;

/**
 * Horario de un turno: desde el inicio del primer slot hasta el fin del último
 * @param {Number[]} slots Slots consecutivos del turno
 * @param {Number} duration Duración de cada slot en minutos
 * @returns {String} Ej: "14:00 - 15:00"
 */
export const slotsToRange = (slots, duration) => {
  const start = Math.min(...slots);
  const end = Math.max(...slots) + duration;
  return `${toHour(start)} - ${toHour(end)}`;
};
