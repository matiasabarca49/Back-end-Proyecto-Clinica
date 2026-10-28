import { addDays, appointmentOverlaps, getDaySchedule, getDaySlots } from '../../../src/modules/appointment/appointment.helpers.js';

// Reglas de horario de los turnos: la grilla de slots de un día, qué horario aplica a cada fecha
// y cuándo dos turnos se superponen. La reserva y la disponibilidad dependen de las tres.

describe('getDaySlots', () => {
  it('arma la grilla desde el inicio del horario sin pasarse del cierre', () => {
    // 09:00 a 18:00 de a 120 min: el slot de las 17:00 terminaría a las 19:00, no entra
    expect(getDaySlots({ start: '09:00', end: '18:00' }, 120)).toEqual([540, 660, 780, 900]);

    // El último slot puede terminar justo a la hora de cierre
    expect(getDaySlots({ start: '11:00', end: '13:00' }, 30)).toEqual([660, 690, 720, 750]);

    // Arranca en el inicio real del horario, no en una hora fija
    expect(getDaySlots({ start: '9:15', end: '12:00' }, 30)).toEqual([555, 585, 615, 645, 675]);
  });
});

describe('getDaySchedule', () => {
  const schedules = {
    monday: { start: '9:00', end: '18:00' },
    wednesday: { start: '14:00', end: '18:00' },
  };

  it('devuelve el horario del día de la semana de la fecha y null el domingo', () => {
    expect(getDaySchedule(schedules, '2026-11-02')).toEqual(schedules.monday);    // lunes
    expect(getDaySchedule(schedules, '2026-11-04')).toEqual(schedules.wednesday); // miércoles
    expect(getDaySchedule(schedules, '2026-11-01')).toBeNull();                   // domingo
  });
});

describe('addDays', () => {
  it('pasa de mes y de año, y respeta los años bisiestos', () => {
    // El calendario y /nearest recorren los días con esta función: un error saltea o repite días
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
  });
});

describe('appointmentOverlaps', () => {
  it('un turno no se superpone con el slot contiguo, pero sí con los que cubre su duración', () => {
    const tenToTenThirty = { slots: [600], duration: 30 };
    expect(appointmentOverlaps(tenToTenThirty, 630, 660)).toBe(false); // 10:30 a 11:00
    expect(appointmentOverlaps(tenToTenThirty, 570, 600)).toBe(false); // 09:30 a 10:00

    // Un turno reservado con 60 min ocupa también el slot de 30 min siguiente
    const tenToEleven = { slots: [600], duration: 60 };
    expect(appointmentOverlaps(tenToEleven, 630, 660)).toBe(true);
  });
});
