import mongoose from "mongoose";
//Model
import { Appointment, ACTIVE_STATUSES } from "./appointment.model.js";
//Base Service
import BaseService from "../../core/services/base.service.js";
//Patients Service
import { PatientsService } from "../patient/index.js";
const patientsService = new PatientsService();
//Doctors Service
import { DoctorsService } from "../doctor/index.js";
const doctorsService = new DoctorsService();
//notification service
import appointmentNotificationService from "./appointment.socket.js";

//Repository
import MongoRepository from "../../core/repositories/implementations/mongo.repository.js";
//DTO
import { AppointmentDTO } from "./appointment.dto.js";
//utils and helpers
import {
  addDays,
  appointmentOverlaps,
  getDaySchedule,
  getDaySlots,
  slotsToRange,
} from "./appointment.helpers.js";
import {
  AppError,
  ConflictError,
  DuplicateError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../core/exceptions/index.js";
import { sendAppointmentConfirmation } from "../../utils/email.helpers.js";
import { validateEnvVars } from "../../utils/dotenv.helper.js";
import CacheService from "../../core/services/cache.service.js";
import { getTodaySTR } from "../../utils/dates.helper.js";
import { searchRegex } from "../../shared/utils/regex.helper.js";
import logger from "../../core/logger/logger.js";
import { withTransaction } from "../../config/mongoDB.config.js";

// En turnos, el único índice único es el de horario (doctor o paciente, día y slot): un duplicado
// es una reserva simultánea que ganó la otra. Se informa en términos del dominio, sin nombres de campos
const toBookingConflict = (error) =>
  error instanceof DuplicateError ? new ConflictError("El horario ya está ocupado") : error;
import { CARIES_FACES, TOOTH_FLAGS } from "../../shared/schemas/tooth.schema.js";

// Un diente sin tratar no tiene ninguna marca en true y todas sus caras de caries están en "0"
const isUntreatedTooth = (tooth) =>
  TOOTH_FLAGS.every(flag => !tooth[flag]) &&
  CARIES_FACES.every(face => tooth.caries[face] === "0");

// Días hacia adelante en los que /nearest busca un turno libre. El límite hace que la búsqueda siempre termine
const NEAREST_SEARCH_DAYS = 60;

// Estados de un turno abierto (sin cerrar como finalizado, ausente o cancelado), de cualquier fecha.
// Con alguno, su doctor o paciente no se puede dar de baja: así un dado de baja nunca tiene turnos para atender o finalizar
const OPEN_STATUSES = ["pending", "confirmed", "waiting", "called"];

export default class AppointmentsService extends BaseService {
  constructor() {
    const repository = new MongoRepository(Appointment);
    super(repository);

    this.cacheService = new CacheService();
  }

  async findAll(filters = {}) {
    const appointment = await super.findAll(filters);
    return this.toManyShortDTO(appointment);
  }

  /**
   * Indicar si un doctor o un paciente tiene turnos abiertos, de cualquier fecha
   * @param {Object} filter { doctorID } o { patientID }
   * @param {Object} options Dentro de una transacción, { session } de quien la abrió
   * @returns {Boolean}
   */
  async hasOpenAppointments(filter, options = {}) {
    const appointment = await this.repository.findByFilter({ ...filter, status: { $in: OPEN_STATUSES } }, options);
    return Boolean(appointment);
  }

  /**
   * Obtener un turno por ID
   * @param {String} id ID del turno
   * @param {Object} user Usuario autenticado (req.user): un doctor solo ve sus propios turnos
   * @returns {Object} Turno
   */
  async findById(id, user) {
    const appointment = await super.findById(id);
    if (!appointment) throw new NotFoundError("Appointment", id);
    this.#assertOwnAppointment(appointment, user);
    return this.toDTO(appointment);
  }

  /**
   * Obtener turnos mediate filtros de busqueda
   * 
   * Esto metodo devuelve los turnos por páginas
   * 
   * @param {Object} filters Filtros de Busqueda[from, to, doctor, patient, status, typeAppointmet, room]
   * @param {Number} limit Cantidad de documentos a devolver
   * @param {Number} page Numero de página
   * @param {Number} sort Filtrar por fecha y slots
   * @returns {Object} Objeto con pagínas de turnos
   */
  async paginateAppointments(filters = {}, limit = 10, page = 1, sort = 1){    
    //Verificar si es ID o nombre de Doctor
    if(filters.doctor){
      if (mongoose.Types.ObjectId.isValid(filters.doctor)) {
        filters.doctorID = filters.doctor;
      } else if (typeof filters.doctor === "string" && filters.doctor.length > 1) {
        //Buscando doctores que coincidan con la persona (searchPaginate escapa el texto)
        const doctorsFounded = await doctorsService.searchPaginate(filters.doctor);
        //Usamos un conjunto de concidencias para un campo. En este caso [_id, _id, _id, _id]
        if (!doctorsFounded.docs.length > 0) {
          return {
                  "docs": [],
                  "totalDocs": 0,
                  "limit": 10,
                  "page": 1,
                  "totalPages": 0,
                  "hasNextPage": false,
                  "hasPrevPage": false
              }
        } else{
          filters.doctorID = { $in: doctorsFounded.docs.map((d) => d.id) }
        }
      }

      delete filters.doctor
    }

    if(filters.patient){

      if (mongoose.Types.ObjectId.isValid(filters.patient)) {
        filters.patientID = filters.patient;
      } else if (typeof filters.patient === "string" && filters.patient.length > 1) {
        //Buscando Pacientes que coincidan con la persona (searchPaginate escapa el texto)
        // includeInactive: los turnos de un paciente dado de baja se siguen encontrando por su nombre
        const patientsFounded = await patientsService.searchPaginate(filters.patient, { includeInactive: true });
        //Usamos un conjunto de concidencias para un campo. En este caso [_id, _id, _id, _id]
        if (!patientsFounded.docs.length > 0) {
            return {
                  "docs": [],
                  "totalDocs": 0,
                  "limit": 10,
                  "page": 1,
                  "totalPages": 0,
                  "hasNextPage": false,
                  "hasPrevPage": false
              }
        }else{
          filters.patientID = { $in: patientsFounded.docs.map((d) => d.id) }
        }
      }

      delete filters.patient
    }  
  
    if(filters.from){
      filters.date = {$gte: filters.from, ...filters.date}
      delete filters.from
    }

    if(filters.to){
      filters.date = {...filters.date, $lte: filters.to, }
      delete filters.to
    }

    // typeAppointment ya viene validado contra la lista de tipos: se compara por igualdad
    if(filters.room){
      filters.room = searchRegex(filters.room)
    }

    switch (parseInt(sort)) {
      case -1:
        sort = { date: -1, slots: -1 };
        break;
      default:
        sort = { date: 1, slots: 1 };
        break;
    }

    const appointmentsFounded = await this.repository.findPaginate(filters,limit,page,sort);

    if (appointmentsFounded) {
      appointmentsFounded.docs = this.toManyShortDTO(appointmentsFounded.docs);
    }
    return appointmentsFounded || [];
  }

  /**
   * Retornar los turnos de hoy
   * 
   * Este método utiliza cache. La ventana de los datos es de 10min
   * 
   * Primero se consulta si los datos estan en cache. Si no lo estan se guarda para la próxima consulta
   * 
   * @returns {Object} Páginas con turnos
   */
  async findToday(filters = {}) {
    //Buscar en cache
    const cachedAppointments = await this.getCacheAppointment(filters.doctorID ? true : false, filters.doctorID || null);
    if (cachedAppointments)  return cachedAppointments;
    
    //En caso de no estar en cache, o ser un usuario con rol doctor, lo traemos de la DB
    const todayString = getTodaySTR()
    
    filters.date = todayString
    
    const appointments = await this.repository.findPaginate(
      filters,
      10,
      1,
      { date: 1, slots: 1 },
    );

    if (!appointments)
      throw new AppError("Error al obtener las citas de hoy", 500);

    appointments.docs = this.toManyShortDTO(appointments.docs);

    //Guardar en cache por 10 minutos. En caso de que no sea un doctor.
    if(!filters.doctorID) {
      this.saveCacheAppointment(appointments)
    }

    return appointments;
  }

  /**
   * Comprobar que un turno se puede reservar en ese horario
   *
   * Los slots tienen que estar en la grilla del día del doctor (su horario y frecuencia) y ser consecutivos.
   * El conflicto se busca por rango de horas y no solo por slot igual: un turno con otra duración
   * (reservado antes de un cambio de frecuencia) puede superponerse sin empezar a la misma hora.
   * Los turnos cancelados no cuentan.
   *
   * @param {Object} appointment Datos del turno { doctorID, patientID, date, slots }, con los slots ordenados (los ordena el DTO)
   * @param {String} excludeID Turno a ignorar en los conflictos (el que se está editando o reactivando)
   * @returns {Object} { doctor, patient }
   */
  async #assertBookable({ doctorID, patientID, date, slots }, excludeID = null) {
    // Ambos lanzan NotFoundError si no existen o fueron dados de baja
    const [doctor, patient] = await Promise.all([
      doctorsService.findById(doctorID),
      patientsService.findById(patientID),
    ]);

    if (doctor.status === false) {
      throw new ValidationError("El profesional está inactivo y no recibe turnos");
    }

    const schedule = getDaySchedule(doctor.schedules, date);
    if (!schedule) throw new ValidationError("El profesional no atiende ese día");

    // La grilla del día sale del horario y la frecuencia actuales del doctor
    const daySlots = getDaySlots(schedule, doctor.frequency);

    if (!slots.every(slot => daySlots.includes(slot))) {
      throw new ValidationError("Los slots están fuera del horario del profesional");
    }

    // Consecutivos = una porción continua de la grilla del día
    const first = daySlots.indexOf(slots[0]);
    if (!slots.every((slot, i) => daySlots[first + i] === slot)) {
      throw new ValidationError("Los slots de un turno deben ser consecutivos");
    }

    const start = slots[0];
    const end = slots.at(-1) + doctor.frequency;

    // aggregate: solo los campos que se comparan, sin el populate del modelo. No castea: los IDs van como ObjectId
    const { ObjectId } = mongoose.Types;
    const sameDay = await this.repository.aggregate([
      { $match: {
          date,
          status: { $in: ACTIVE_STATUSES },
          $or: [{ doctorID: new ObjectId(doctorID) }, { patientID: new ObjectId(patientID) }],
          ...(excludeID && { _id: { $ne: new ObjectId(excludeID) } }),
      } },
      { $project: { _id: 0, doctorID: 1, slots: 1, duration: 1 } },
    ]);

    const conflicts = sameDay.filter(appointment => appointmentOverlaps(appointment, start, end));

    // Si choca con los dos, se informa el del doctor
    if (conflicts.some(appointment => appointment.doctorID.equals(doctor.id))) {
      throw new ValidationError("El doctor ya tiene un turno reservado en ese horario");
    }
    if (conflicts.length > 0) {
      throw new ValidationError("El paciente ya tiene un turno reservado en ese horario");
    }

    return { doctor, patient };
  }

  /**
   * Comprobar que el usuario puede operar sobre el turno
   *
   * Un doctor solo opera sobre sus propios turnos; admin y employee, sobre todos.
   *
   * @param {Object} appointment Turno con doctorID populado
   * @param {Object} user Usuario autenticado (req.user)
   */
  #assertOwnAppointment(appointment, user) {
    if (user.rol === "doctor" && !appointment.doctorID._id.equals(user.id)) {
      throw new ForbiddenError("Solo el doctor asignado puede operar sobre este turno");
    }
  }

  /**
   * Comprobar que el usuario puede asignar el turno a ese doctor
   *
   * Un doctor solo puede reservar o mover turnos a su propio nombre; admin y employee, a cualquiera.
   *
   * @param {String} doctorID Doctor al que se asigna el turno (validado como MongoId)
   * @param {Object} user Usuario autenticado (req.user)
   */
  #assertAssignable(doctorID, user) {
    if (user.rol === "doctor" && String(doctorID).toLowerCase() !== String(user.id)) {
      throw new ForbiddenError("Un doctor solo puede asignarse turnos a sí mismo");
    }
  }

  /**
   * Comprobar que el usuario puede consultar la disponibilidad de ese doctor
   *
   * Un doctor solo consulta la suya; admin y employee, la de cualquiera. Va antes de buscar al
   * doctor: así un doctor recibe 403 también con un id que no existe y no puede averiguar cuáles existen.
   *
   * @param {String} doctorID Doctor consultado (validado como MongoId)
   * @param {Object} user Usuario autenticado (req.user)
   */
  #assertCanViewAvailability(doctorID, user) {
    if (user.rol === "doctor" && String(doctorID).toLowerCase() !== String(user.id)) {
      throw new ForbiddenError("Un doctor solo puede consultar su propia disponibilidad");
    }
  }

  /**
   * Crear un turno nuevo
   * @param {Object} newAppointment Datos del turno
   * @param {Object} user Usuario autenticado (req.user)
   * @returns {Object} Turno creado
   */
  async create(newAppointment, user) {
    this.#assertAssignable(newAppointment.doctorID, user);

    // Mismas reglas de reserva que update: horario del doctor, slots consecutivos y conflictos
    const { doctor, patient } = await this.#assertBookable(newAppointment);

    // Crear la nueva cita. La duración se fija con la frecuencia actual del doctor
    const newAppointmentFormated = new AppointmentDTO({ ...newAppointment, duration: doctor.frequency });
    const appointmentAdded = await super.create(newAppointmentFormated)
      .catch(error => { throw toBookingConflict(error) });

    //Como mongo nos devuelve solo el ID. Lo cambiamos por el doctor completo
    //Transformar de documento de Mongoose a objeto
    const objAppointment = appointmentAdded.toObject()
    objAppointment.doctorID = doctor
    objAppointment.patientID = patient

    //Invalidar cache de citas de hoy si la cita creada es para el día actual (date ya es YYYY-MM-DD)
    if (newAppointment.date === getTodaySTR()) {
      this.deleteCacheAppointment()
    }

    if (!validateEnvVars("email")) {
      logger.info("Email de confirmación omitido: configuración de correo no disponible.");
      return this.toShortDTO(objAppointment)
    } 

    //Enviar email de confirmación al paciente
    //Verificar que esten los datos correctos para enviar el mail
    const emailValidationError = this.validateAppointmentEmailData(patient, appointmentAdded);

    if (emailValidationError) {
      logger.warn(`Email de confirmación no enviado: ${emailValidationError}.`);
      return this.toShortDTO(objAppointment);
    }

    //enviar email
    const patientFullName = `${patient.name} ${patient.lastName}`;
    const appointmentTime = slotsToRange(appointmentAdded.slots, appointmentAdded.duration);

    const emailSent = await sendAppointmentConfirmation(
      patient.email,
      patientFullName,
      appointmentAdded.date,
      appointmentTime,
    );

    if (emailSent) {
      logger.info(`Email de confirmación enviado a ${patient.email}`);
    } else {
      logger.error(
        `Error al enviar email a ${patient.email} (problema con el transporter)`,
      );
    }
  
    return this.toShortDTO(objAppointment);
  }

  /**
   * Actualizar los datos editables de un turno
   *
   * Un turno finalizado no se edita: queda como registro. Las reglas de reserva se aplican solo si
   * cambia la reserva (doctor, paciente, fecha o slots); así se puede editar una observación aunque
   * el doctor haya cambiado su horario o frecuencia después de reservar.
   *
   * @param {String} appointmentID ID del turno
   * @param {Object} toUpdate Datos del turno (body del request)
   * @param {Object} user Usuario autenticado (req.user)
   * @returns {Object} Turno actualizado
   */
  async update(appointmentID, toUpdate, user) {
    const current = await this.repository.findByFilter({ _id: appointmentID });
    if (!current) throw new NotFoundError("Appointment", appointmentID);

    // Un doctor edita solo sus turnos y no puede pasárselos a otro doctor
    this.#assertOwnAppointment(current, user);
    this.#assertAssignable(toUpdate.doctorID, user);

    if (current.status === "finalized") {
      throw new ConflictError("Un turno finalizado no se puede modificar");
    }

    // El DTO descarta todo campo no editable (status, duration, odontogram, operadores $) y ordena los slots.
    // PUT es completo (validateUpdateAppointment exige doctor, paciente, fecha y slots), así que fields los trae
    const fields = AppointmentDTO.toUpdate(toUpdate);

    const changesBooking =
      current.date !== fields.date ||
      !current.doctorID._id.equals(fields.doctorID) ||
      !current.patientID._id.equals(fields.patientID) ||
      current.slots.join() !== fields.slots.join();

    // Con el paciente en la sala o en el sillón, la reserva ya no se mueve: solo sala, tipo y observaciones
    const inProgress = ["waiting", "called"];

    if (changesBooking) {
      if (inProgress.includes(current.status)) {
        throw new ConflictError("No se puede cambiar el doctor, el paciente, la fecha ni el horario de un turno en espera o en consulta");
      }

      // Mismas reglas que al crear, ignorando el propio turno en los conflictos
      const { doctor } = await this.#assertBookable(fields, appointmentID);
      // Los slots quedan en la grilla actual del doctor, así que la duración también
      fields.duration = doctor.frequency;
    }

    // status en el filtro: si el turno se finaliza (o, al mover la reserva, pasa a espera o consulta)
    // entre la lectura y la escritura, no se modifica
    const blockedStatuses = changesBooking ? [...inProgress, "finalized"] : ["finalized"];
    const updatedAppointment = await this.repository.updateByFilter(
      { _id: appointmentID, status: { $nin: blockedStatuses } },
      fields,
    ).catch(error => { throw toBookingConflict(error) });

    if (!updatedAppointment) {
      throw new ConflictError("El turno cambió de estado o se eliminó mientras se editaba. Intente nuevamente");
    }

    // Invalidar cache de citas de hoy si el turno era o pasó a ser de hoy (puede haber cambiado de fecha)
    const todayString = getTodaySTR()

    if (current.date === todayString || updatedAppointment.date === todayString) {
      this.deleteCacheAppointment()
    }
    return this.toDTO(updatedAppointment);
  }

  /**
   * Obtener los slots libres de cada día de un rango para un doctor
   *
   * Es la única regla de qué está libre: la usan /available, /nearest y el calendario.
   * Trae los turnos activos del rango en una sola consulta y solo con date, slots y duration
   * (aggregate no dispara el populate del modelo). Un slot de la grilla está libre si no se
   * superpone con ningún turno.
   *
   * @param {Object} doctor Doctor (DTO)
   * @param {String} from Fecha inicial YYYY-MM-DD, incluida
   * @param {String} to Fecha final YYYY-MM-DD, incluida
   * @returns {Array} [{ date, daySlots, freeSlots }] por día; daySlots vacío si ese día no atiende o está inactivo
   */
  async #getFreeSlotsByDay(doctor, from, to) {
    // aggregate no castea: el ID del doctor va como ObjectId
    const appointments = await this.repository.aggregate([
      { $match: {
          doctorID: new mongoose.Types.ObjectId(doctor.id),
          date: { $gte: from, $lte: to },
          status: { $in: ACTIVE_STATUSES },
      } },
      { $project: { _id: 0, date: 1, slots: 1, duration: 1 } },
    ]);

    const days = [];
    // Las fechas YYYY-MM-DD se pueden comparar como texto
    for (let date = from; date <= to; date = addDays(date, 1)) {
      // Un doctor inactivo no recibe turnos: todos sus días quedan sin slots
      const schedule = doctor.status === false ? null : getDaySchedule(doctor.schedules, date);
      const daySlots = schedule ? getDaySlots(schedule, doctor.frequency) : [];
      const dayAppointments = appointments.filter(appointment => appointment.date === date);
      const freeSlots = daySlots.filter(slot =>
        !dayAppointments.some(appointment => appointmentOverlaps(appointment, slot, slot + doctor.frequency))
      );
      days.push({ date, daySlots, freeSlots });
    }
    return days;
  }

  /**
   * Obtener la grilla de un doctor en un día: los slots libres y los ocupados
   *
   * Libres y ocupados juntos forman la grilla completa del día, así el front la muestra sin
   * calcular el horario del doctor. Ocupado = se superpone con algún turno activo.
   *
   * @param {String} idDoctor ID del doctor
   * @param {String} day Fecha YYYY-MM-DD
   * @param {Object} user Usuario autenticado (req.user): un doctor solo consulta su propia disponibilidad
   * @returns {Object} { date, duration, slots, occupiedSlots } con los slots en minutos del día
   */
  async getAvailableAppointments(idDoctor, day, user) {
    this.#assertCanViewAvailability(idDoctor, user);
    // Lanza NotFoundError si el doctor no existe o fue dado de baja
    const doctor = await doctorsService.findById(idDoctor);

    const [{ daySlots, freeSlots }] = await this.#getFreeSlotsByDay(doctor, day, day);
    const occupiedSlots = daySlots.filter(slot => !freeSlots.includes(slot));

    return { date: day, duration: doctor.frequency, slots: freeSlots, occupiedSlots };
  }

  /**
   * Obtener la disponibilidad diaria de un doctor en un rango, para el calendario
   *
   * Devuelve todos los días del rango, también los que no atiende, para que el front no tenga que
   * interpretar un día ausente.
   *
   * @param {String} idDoctor ID del doctor
   * @param {String} from Fecha inicial YYYY-MM-DD, incluida
   * @param {String} to Fecha final YYYY-MM-DD, incluida
   * @param {Object} user Usuario autenticado (req.user): un doctor solo consulta su propia disponibilidad
   * @returns {Object} { doctorID, frequency, from, to, days: [{ date, status, total, occupied, free }] }
   */
  async getAvailability(idDoctor, from, to, user) {
    this.#assertCanViewAvailability(idDoctor, user);
    // Lanza NotFoundError si el doctor no existe o fue dado de baja
    const doctor = await doctorsService.findById(idDoctor);

    // Misma regla de slots libres que /available y la reserva
    const days = await this.#getFreeSlotsByDay(doctor, from, to);

    return {
      doctorID: doctor.id,
      frequency: doctor.frequency,
      from,
      to,
      days: days.map(({ date, daySlots, freeSlots }) => {
        const total = daySlots.length;
        const free = freeSlots.length;
        const status = total === 0 ? "closed" : free === 0 ? "full" : "available";
        return { date, status, total, occupied: total - free, free };
      }),
    };
  }

  /**
   * Obtener el día más cercano con slots libres para un doctor, a partir de mañana
   * @param {String} idDoctor ID del doctor
   * @param {Object} user Usuario autenticado (req.user): un doctor solo consulta su propia disponibilidad
   * @returns {Object} { date, duration, slots, slotsText } con los slots libres de ese día
   */
  async getNearestAppointments(idDoctor, user) {
    this.#assertCanViewAvailability(idDoctor, user);
    // Lanza NotFoundError si el doctor no existe o fue dado de baja
    const doctor = await doctorsService.findById(idDoctor);

    // Todo el período en una sola consulta, en vez de una por día
    const from = addDays(getTodaySTR(), 1);
    const days = await this.#getFreeSlotsByDay(doctor, from, addDays(from, NEAREST_SEARCH_DAYS - 1));

    const nearest = days.find(day => day.freeSlots.length > 0);
    if (!nearest) {
      throw new NotFoundError(`Turno libre en los próximos ${NEAREST_SEARCH_DAYS} días`);
    }

    return {
      date: nearest.date,
      duration: doctor.frequency,
      slots: nearest.freeSlots,
      slotsText: nearest.freeSlots.map(slot => slotsToRange([slot], doctor.frequency)),
    };
  }

  /**
   * Eventos
   */

  /**
   * Método para cambiar el estado de una cita a "waiting" (check-in)
   * @param {String} appointmentID ID del turno
   * @param {String} room Consultorio asignado al llegar (opcional)
   * @param {Object} user Usuario autenticado (req.user): un doctor solo opera sobre sus turnos
   * @returns {Object} Turno en espera
  */
  async checkIn(appointmentID, room, user) {
    const appointment = await this.repository.findByFilter({ _id: appointmentID });

    if (!appointment) {
      throw new NotFoundError("Appointment", appointmentID);
    }

    this.#assertOwnAppointment(appointment, user);

    if (appointment.status.toLowerCase() !== "confirmed" && appointment.status.toLowerCase() !== "called") {
      throw new ValidationError(
        "Solo los turnos confirmados o llamados pueden pasar a espera.",
      );
    }

    const fields = {status: "waiting"}
    //Cambio de room
    if(room) fields.room = room

    // status en el filtro: si el turno cambió de estado después de leerlo (ej: se canceló), no se pisa
    const updateAppointment = await this.repository.updateByFilter(
      { _id: appointmentID, status: appointment.status },
      fields,
    );

    if (!updateAppointment) {
      throw new ConflictError("El turno cambió mientras se actualizaba. Intente nuevamente");
    }

    appointment.status = "waiting"
    if (room) appointment.room = room

    //Eliminar cache o invalidad contenido
    this.deleteCacheAppointment()

    const appointmentDTO = this.toShortDTO(appointment);

    //Notificar al doctor. Es asincronico pero no se rompe el flujo
    void appointmentNotificationService.notifyPatientWaiting(appointmentDTO);
      
    return appointmentDTO;
}

/**
 * Método que maneja a traves de eventos los turnos en estado de espera
 * @param {String} appointmentID ID del turno
 * @param {Object} user Usuario autenticado (req.user): un doctor solo llama a sus pacientes
 * @returns {Object} Turno llamado
 */
async call(appointmentID, user) {
    const appointment = await this.repository.findByFilter({ _id: appointmentID });

    if (!appointment) {
        throw new NotFoundError("Appointment", appointmentID);
    }

    this.#assertOwnAppointment(appointment, user);

    if (appointment.status.toLowerCase() !== "waiting") {
        throw new ValidationError(
            "Solo los turnos en espera pueden ser llamados."
        );
    }

    // status en el filtro: si el turno dejó de estar en espera después de leerlo, no se pisa
    const updatedAppointment = await this.repository.updateByFilter(
        { _id: appointmentID, status: "waiting" },
        { status: "called" }
    );

    if (!updatedAppointment) {
        throw new ConflictError("El turno cambió mientras se actualizaba. Intente nuevamente");
    }

    appointment.status = "called";
    //Eliminar cache o invalidar contenido
    this.deleteCacheAppointment()

    const appointmentDTO = this.toShortDTO(appointment);

    void appointmentNotificationService.notifyPatientCalled(appointmentDTO);

    return appointmentDTO;
}

/**
 * Finalizar un turno
 *
 * Pasa el turno de "called" a "finalized" y guarda su odontograma en el del paciente.
 * Las dos escrituras van en una transacción: si una falla, el paciente no queda con dientes
 * de un turno que no se finalizó.
 *
 * @param {String} appointmentID ID del turno
 * @param {Object} user Usuario autenticado (req.user): un doctor solo finaliza sus turnos
 * @returns {Object} Turno finalizado
 */
async finalize(appointmentID, user) {
    // Fusión en el paciente y finalización del turno van juntas: si una falla, no se guarda ninguna
    const appointment = await withTransaction(async (session) => {
        // La lectura va adentro: de ella sale qué dientes se fusionan, y si se reintenta se vuelve a leer
        const current = await this.repository.findByFilter({ _id: appointmentID }, { session });

        if (!current) {
            throw new NotFoundError("Appointment", appointmentID);
        }

        this.#assertOwnAppointment(current, user);

        if (current.status.toLowerCase() !== "called") {
            throw new ValidationError(
                "Solo los turnos llamados pueden finalizarse."
            );
        }

        if (current.odontogram.length > 0) {
            // patientID viene populado; es null si el paciente fue eliminado
            if (!current.patientID) throw new NotFoundError("Paciente");

            await patientsService.mergeOdontogram(
                current.patientID._id,
                current.odontogram.map(tooth => tooth.toObject()),
                { session }
            );
        }

        // status y lastChange en el filtro: si el turno cambió después de leerlo, no se finaliza
        // y la transacción descarta la fusión
        const updatedAppointment = await this.repository.updateByFilter(
            { _id: appointmentID, status: "called", lastChange: current.lastChange },
            { status: "finalized" },
            { session }
        );

        if (!updatedAppointment) {
            throw new ConflictError("El turno cambió mientras se finalizaba. Intente nuevamente");
        }

        current.status = "finalized";
        return current;
    });

    // Fuera de la transacción: si se reintenta, no se invalida el cache ni se notifica dos veces
    this.deleteCacheAppointment()

    const appointmentDTO = this.toShortDTO(appointment);

    void appointmentNotificationService.notifyPatientFinalized(appointmentDTO);

    return appointmentDTO;
  }


  /**
   * Cambiar el estado de un turno a confirmed, noshow, rescheduled o canceled
   *
   * Un turno en espera, en consulta o finalizado sigue su propio flujo (check-in, call, finalize):
   * no se puede cancelar ni cambiar por acá. Cancelar libera el horario, así que reactivar un
   * cancelado aplica las mismas reglas que reservar: su horario puede haberse ocupado o dejado de existir.
   *
   * @param {String} appointmentID ID del turno
   * @param {String} status Estado nuevo
   * @returns {Object} Turno con el estado actualizado
   */
  async changeStatus(appointmentID, status) {
    const appointment = await this.repository.findByFilter({ _id: appointmentID });

    if (!appointment) {
      throw new NotFoundError("Appointment", appointmentID);
    }

    if (["waiting", "called", "finalized"].includes(appointment.status)) {
      throw new ConflictError("No se puede cambiar el estado de un turno en espera, en consulta o finalizado");
    }

    const fields = { status };

    // Mismas reglas que al crear, ignorando el propio turno en los conflictos:
    // - un cancelado liberó su horario: cualquier salida lo vuelve a ocupar
    // - un ausente o reprogramado que vuelve a confirmed: así no se reabre con un doctor o paciente dado de baja
    if ((appointment.status === "canceled" && status !== "canceled") ||
        (["noshow", "rescheduled"].includes(appointment.status) && status === "confirmed")) {
      const { doctor } = await this.#assertBookable({
        doctorID: appointment.doctorID._id.toString(),
        patientID: appointment.patientID._id.toString(),
        date: appointment.date,
        slots: appointment.slots,
      }, appointmentID);
      // Los slots están en la grilla actual del doctor, así que la duración también
      fields.duration = doctor.frequency;
    }

    // status en el filtro: si el turno cambió de estado después de leerlo, no se pisa
    const updateAppointment = await this.repository.updateByFilter(
      { _id: appointmentID, status: appointment.status },
      fields,
    ).catch(error => { throw toBookingConflict(error) });

    if (!updateAppointment) {
      throw new ConflictError("El turno cambió mientras se actualizaba. Intente nuevamente");
    }

    appointment.status = status
    if (fields.duration) appointment.duration = fields.duration
    
    //Eliminar cache o invalidar contenido
    this.deleteCacheAppointment()

    const appointmentDTO = this.toShortDTO(appointment);

    //Notificar al doctor. Es asincronico pero no se rompe el flujo
    void appointmentNotificationService.notifyChangeStatusApp(appointmentDTO);
      
    return appointmentDTO;
}

  /**
   * Obtener el odontograma de un turno
   *
   * @param {String} appointmentID ID del turno
   * @param {Object} user Usuario autenticado (req.user): un doctor solo ve el de sus turnos
   * @returns {Array} Dientes tratados en el turno
   */
  async getOdontogram(appointmentID, user) {
    const appointment = await super.findById(appointmentID);
    if (!appointment) throw new NotFoundError("Appointment", appointmentID);
    this.#assertOwnAppointment(appointment, user);
    return appointment.odontogram;
  }

  /**
   * Agregar, reemplazar o quitar un diente en el odontograma del turno
   *
   * Solo se puede mientras el turno está en consulta ("called"); al finalizarlo, el odontograma
   * se guarda en el del paciente. El body trae el estado completo del diente: si ya está en el
   * turno se reemplaza, y si llega sin tratar (todo en false y caries en "0") se quita del turno.
   *
   * @param {String} appointmentID ID del turno
   * @param {Object} tooth Estado completo del diente (toothSchema)
   * @param {Object} userSession Usuario autenticado (req.user)
   * @returns {Array} Odontograma del turno actualizado
   */
  async upsertTooth(appointmentID, tooth, userSession) {
    const appointment = await this.repository.findByFilter({ _id: appointmentID });

    if (!appointment) throw new NotFoundError("Appointment", appointmentID);

    this.#assertOwnAppointment(appointment, userSession);

    if (appointment.status !== "called") {
      throw new ConflictError("El odontograma solo se puede modificar mientras el turno está en consulta");
    }

    // status en el filtro: si el turno se finaliza entre la lectura y la escritura, no se escribe.
    // Cada update es atómico, así que funciona igual con dos instancias.
    const inConsultation = { _id: appointmentID, status: "called" };
    let updated;

    if (isUntreatedTooth(tooth)) {
      updated = await this.repository.updateByFilter(
        inConsultation,
        { $pull: { odontogram: { tooth: tooth.tooth } } }
      );
    } else {
      // Si el diente ya está en el turno se reemplaza; si no, se agrega.
      // El número de diente va en el filtro para que dos pedidos simultáneos no lo dupliquen.
      updated = await this.repository.updateByFilter(
        { ...inConsultation, "odontogram.tooth": tooth.tooth },
        { $set: { "odontogram.$": tooth } }
      );

      if (!updated) {
        updated = await this.repository.updateByFilter(
          { ...inConsultation, "odontogram.tooth": { $ne: tooth.tooth } },
          { $push: { odontogram: tooth } }
        );
      }
    }

    if (!updated) throw new ConflictError("El turno cambió durante la operación. Intente nuevamente");

    return updated.odontogram;
  }

  /**
   * Cache
   */

  //Obtener de Cache
  async getCacheAppointment(isDoctor = false, doctorID = null){
    const todayString = getTodaySTR()
    const cachedAppointments = await this.cacheService.get(
      `appointments:${todayString}`,
    );

    if(!cachedAppointments) {
      return null
    }
    
    if(isDoctor && !doctorID) {
      throw new ValidationError("Se requiere el ID del doctor para filtrar las citas")
    }
    
    if(isDoctor && doctorID) {
      cachedAppointments.docs = cachedAppointments.docs.filter(appointment => appointment.doctorID.id === doctorID);
      return cachedAppointments;
    }

    
    return cachedAppointments;
  }

  //Guardar en Cache
  async saveCacheAppointment(appointments){
    const todayString = getTodaySTR()
    
    await this.cacheService.set(
      `appointments:${todayString}`,
      appointments,
      600,
    ); //600 segundos = 10 minutos
  }

  // Borrar turnos del cache. Los llamadores no lo esperan: un fallo de Redis se registra
  // acá en vez de quedar como promesa rechazada sin manejar
  async deleteCacheAppointment(){
    const todayKey = `appointments:${getTodaySTR()}`;

    try {
      await this.cacheService.del(todayKey);
    } catch (error) {
      logger.error({ message: "Error al invalidar el cache de turnos de hoy", error: error.message, stack: error.stack });
    }
  }

  validateAppointmentEmailData(patient, appointment) {
      if (!patient) {
        return "patient es null";
      }

      if (
        typeof patient === "string" ||
        patient.constructor?.name === "ObjectId"
      ) {
        return "patient no está populado";
      }

      if (!patient.email) {
        return "patient no tiene email";
      }

      if (!appointment.slots?.length) {
        return "no hay slots";
      }

      return null;
  }

  //Métodos de mapeo DTO
  toDTO(appointment) {
    return AppointmentDTO.toResponse(appointment);
  }

  toShortDTO(appointment) {
    return AppointmentDTO.toShortResponse(appointment);
  }

  toManyShortDTO(appointments) {
    return appointments
      .filter(
        (appointment) =>
          appointment.patientID !== null && appointment.doctorID !== null,
      )
      .map((appointment) => AppointmentDTO.toShortResponse(appointment));
  }
}
