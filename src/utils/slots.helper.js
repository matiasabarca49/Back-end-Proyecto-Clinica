// slotsHelper.js

/**
 * Convierte un slot numérico en un horario legible
 * @param {number[]} slots - Array de slots (0-17)
 * @param {string} startHour - Hora de inicio del día, formato "HH:MM" (por defecto 09:00)
 * @param {number} slotDuration - Duración de cada slot en minutos (por defecto 30)
 * @returns {string[]} Array de rangos horarios ["09:00 - 09:30", ...]
 */
export const slotsToHours = (slots, startHour = "09:00", slotDuration = 30) => {
  const [startH, startM] = startHour.split(":").map(Number);

  return slots.map(slot => {
    // hora inicial del slot
    /*  "startH * 60 + startM"  calculamos el total de minutos desde las 00:00. Esto nos permite obtener la hora exacta. Minutos que pasaron desde las 00:00 a las 9:00
    *  "slot * slotDuration" esta expresion nos permite obtner el tiempo que paso desde el slot 0 [9:00] al slot 10 [14:00]
    */
    let totalMinutesStart = startH * 60 + startM + slot * slotDuration;
    //Obtenemos la hora quedandonos la parte entera del calculo
    let startHourSlot = Math.floor(totalMinutesStart / 60);
    //Obtenemos con el modulo los minutos restantes
    let startMinuteSlot = totalMinutesStart % 60;

    // hora final del slot
    //Como ya tenemos los minutos totales en el horacio de inicio del turno, se sumamo la duracion del mismo. 30 minutos
    let totalMinutesEnd = totalMinutesStart + slotDuration;
    let endHourSlot = Math.floor(totalMinutesEnd / 60);
    let endMinuteSlot = totalMinutesEnd % 60;

    // formato HH:MM
    /**
     * Funcion flecha que nos permite mantener siempre dos digitos en los numero. En caso de no 
     * tener dos digito el numero pasado, se le agrega un cero adelante
     * */  
    const pad = num => num.toString().padStart(2, "0");
    return `${pad(startHourSlot)}:${pad(startMinuteSlot)} - ${pad(endHourSlot)}:${pad(endMinuteSlot)}`;
  });
};

const pad = num => num.toString().padStart(2, "0");

const minutesToHHMM = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${pad(h)}:${pad(m)}`;
};

/**
 * Convierte un array de slots en rangos horarios combinando consecutivos
 * @param {number[]} slots - Array de slots (0-17)
 * @param {string} startHour - Hora de inicio del día (HH:MM), default "09:00"
 * @param {number} slotDuration - Duración de cada slot en minutos, default 30
 * @returns {string[]} Ej: ["09:00 - 10:30", "15:00 - 15:30"]
 */
export const slotsToRanges = (slots, startHour = "09:00", slotDuration = 30) => {
  // Si no hay slots, devolver array vacío
  if (!slots || slots.length === 0) return [];

  // Convertir hora de inicio a formato de minutos desde medianoche
  const [startH, startM] = startHour.split(":").map(Number);
  const startMinutes = startH * 60 + startM;  // Ej: 9:00 = 540 minutos

  // Ordenar slots por seguridad (en caso de que vengan desordenados)
  slots.sort((a, b) => a - b);  // [3,1,5,2] → [1,2,3,5]

  let ranges = [];               // Array que contendrá los rangos finales
  let rangeStart = slots[0];     // Primer slot del rango actual que estamos construyendo
  let prev = slots[0];           // Slot anterior para detectar si la secuencia se rompe

  // Iterar por todos los slots + 1 (para procesar el último rango al final)
  for (let i = 1; i <= slots.length; i++) {
    const current = slots[i];  // Slot actual (undefined en la última iteración)

    // ¿Se rompió la secuencia consecutiva? (ej: de 3 saltamos a 5)
    if (current !== prev + 1) {
      // CERRAR el rango actual antes de empezar uno nuevo
      
      // Calcular tiempo de INICIO(en minutos): desde inicio base + saltar rangeStart slots
      // rangeStart es el slot de inicio
      const startTime = startMinutes + rangeStart * slotDuration;
      
      // Calcular tiempo de FIN: desde inicio base + saltar hasta DESPUÉS del último slot
      // Usamos (prev + 1) porque queremos el FIN del último slot(Hora en que termino el turno), no su inicio
      const endTime = startMinutes + (prev + 1) * slotDuration;

      // Agregar el rango formateado al resultado
      ranges.push(`${minutesToHHMM(startTime)} - ${minutesToHHMM(endTime)}`);

      // EMPEZAR nuevo rango: el slot actual será el inicio del próximo rango
      rangeStart = current;
    }

    // Actualizar el slot anterior para la próxima comparación
    prev = current;
  }

  return ranges;
};

/* 
EJEMPLO DE FUNCIONAMIENTO:
Input: slots = [1, 2, 3, 5, 6, 7, 10], startHour = "09:00", slotDuration = 30

1. Inicial: rangeStart=1, prev=1
2. i=1: current=2, 2===1+1 ✓ (consecutivo) → continúa, prev=2
3. i=2: current=3, 3===2+1 ✓ (consecutivo) → continúa, prev=3  
4. i=3: current=5, 5≠3+1 ❌ (se rompe) → CERRAR rango [1,2,3] = "09:30-11:00"
   Nuevo rango: rangeStart=5, prev=5
5. i=4: current=6, 6===5+1 ✓ (consecutivo) → continúa, prev=6
6. i=5: current=7, 7===6+1 ✓ (consecutivo) → continúa, prev=7
7. i=6: current=10, 10≠7+1 ❌ (se rompe) → CERRAR rango [5,6,7] = "11:30-13:00"
   Nuevo rango: rangeStart=10, prev=10
8. i=7: current=undefined, undefined≠10+1 ❌ → CERRAR último rango [10] = "12:00-12:30"

Output: ["09:30-11:00", "11:30-13:00", "12:00-12:30"]
*/

/**
 * Obtiene los slots disponibles a partir de los slots ocupados
 * @param {*} occupiedSlots 
 * @param {*} totalSlots 
 * @returns 
 */
export const getAvailableSlots = (occupiedSlots, totalSlots = 18) => {
  const allSlots = Array.from({ length: totalSlots }, (_, i) => i); // [0, 1, 2, ..., 17]
  const occupiedSet = new Set(occupiedSlots); // Convertir a Set para búsqueda rápida
  return allSlots.filter(slot => !occupiedSet.has(slot)); // Filtrar los slots ocupados
}

