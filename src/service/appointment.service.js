import mongoose from "mongoose";
//Model
import { Appointment } from "../model/mongo/appointment.model.js";
//Base Service
import BaseService from "./base.service.js";
//Patients Service
import PatientsService from "./patient.service.js";
const patientsService = new PatientsService();
//Doctors Service
import DoctorsService from "./doctor.service.js";
const doctorsService = new DoctorsService();
//notification service
import notificationService from "./notification/notification.service.js";

//Repository
import MongoRepository from "../repositories/implementations/mongo.repository.js";
//DTO
import { AppointmentDTO } from "../dto/appointment.dto.js";
//utils and helpers
import { determineSearchType } from "../utils/utils.js";
import {
  getAvailableSlots,
  slotsToHours,
  slotsToRanges,
} from "../utils/slots.helper.js";
import {
  NotFoundError,
  ValidationError,
} from "../exceptions/validations.exception.js";
import { sendAppointmentConfirmation } from "../utils/email.helpers.js";
import { validateEnvVars } from "../utils/dotenv.helper.js";
import AppError from "../exceptions/AppErrors.js";
import CacheService from "./cache/cache.service.js";
import { dateNotHours } from "../utils/dates.helper.js";

export default class AppointmentsService extends BaseService {
  constructor() {
    const repository = new MongoRepository(Appointment);
    super(repository);

    this.cacheService = new CacheService();
  }

  async findAll() {
    const appointment = await super.findAll();
    return this.toManyShortDTO(appointment);
  }

  async findById(id) {
    const appointment = await super.findById(id);
    if (!appointment) throw new NotFoundError("Appointment", id);
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
  async paginateAppointments(filters = {}, limit = 10, page = 1, sort = 1) {
    
    //Verificar si es ID o nombre de Doctor
    if(filters.doctor){
      if (mongoose.Types.ObjectId.isValid(filters.doctor)) {
        filters.doctorID = filters.doctor;
      } else if (typeof filters.doctor === "string" && filters.doctor.length > 1) {
        const searchRegex = new RegExp(filters.doctor, "i");
        //Buscando doctores que coincidan con la persona
        const doctorsFounded = await doctorsService.searchPaginate(searchRegex);
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
        const searchRegex = new RegExp(filters.patient, "i");
        //Buscando Pacientes que coincidan con la persona
        const patientsFounded = await patientsService.searchPaginate(searchRegex);
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

    if(filters.typeAppointment){
      const searchRegex = new RegExp(filters.typeAppointment, "i");
      filters.typeAppointment = searchRegex 
    }

    if(filters.room){
      const searchRegex = new RegExp(filters.room, "i");
      filters.room = searchRegex 
    }

    if (filters.status) {
      filters.status = filters.status;
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
  async findToday() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Establecer a medianoche para comparar solo fechas
    const day = today.getUTCDate().toString().padStart(2, "0");
    const month = (today.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = today.getUTCFullYear();
    const todayString = `${year}-${month}-${day}`;

    //Buscar en cache
    const cachedAppointments = await this.cacheService.get(
      `appointments:${todayString}`,
    );
    if (cachedAppointments) {
      console.log(`Citas de hoy ${todayString} obtenidas de cache`);
      return cachedAppointments;
    }

    const appointments = await this.repository.findPaginate(
      { date: todayString },
      10,
      1,
      { date: 1, slots: 1 },
    );

    if (!appointments)
      throw new AppError("Error al obtener las citas de hoy", 500);

    appointments.docs = this.toManyShortDTO(appointments.docs);

    //Guardar en cache por 10 minutos
    console.log(
      `Guardando citas de hoy ${todayString} en cache por 10 minutos`,
    );
    await this.cacheService.set(
      `appointments:${todayString}`,
      appointments,
      600,
    ); // 600 segundos = 10 minutos

    return appointments;
  }

  /**
   * Crear un turno nuevo
   * @param {*} newAppointment 
   * @returns {Object}
   */
  async create(newAppointment) {
    const { date, doctorID, patientID, slots } = newAppointment;

    // Verificar conflictos de horarios para el doctor y el paciente
    const turnoFounded = await this.repository.findByFilter({
      date: date,
      slots: { $in: slots },
      $or: [
        { doctorID: doctorID }, // El doctor ya tiene turno
        { patientID: patientID }, // El paciente ya tiene turno
      ],
    });

    if (turnoFounded) {
      // Determinar qué conflicto existe
      if (turnoFounded.doctorID._id.toString() === doctorID) {
        throw new ValidationError(
          "El doctor ya tiene un turno reservado en ese horario",
        );
      }
      if (turnoFounded.patientID._id.toString() === patientID) {
        throw new ValidationError(
          "El paciente ya tiene un turno reservado en ese horario",
        );
      }
    }

    //Corroborrar que el doctor y paciente existan
    const doctorExists = await doctorsService.findById(doctorID);
    if (!doctorExists) {
      throw new NotFoundError("Doctor", doctorID);
    }

    const patientExists = await patientsService.findById(patientID);
    if (!patientExists) {
      throw new NotFoundError("Paciente", patientID);
    }

    // Crear la nueva cita
    const newAppointmentFormated = new AppointmentDTO(newAppointment);
    const appointmentAdded = await super.create(newAppointmentFormated);

    //Invalidar cache de citas de hoy si la cita creada es para el día actual
    const todayKey = `appointments:${dateNotHours(new Date())}`;
    const appointmentDate = dateNotHours(new Date(date));

    if (appointmentDate === dateNotHours(new Date())) {
      console.log("La cita creada es para hoy. Invalidando cache...");
      await this.cacheService.del(todayKey);
    }

    if (!validateEnvVars("email")) {
      console.warn(
        "⚠️ [Info] Email de confirmación no enviado: variables de entorno para email no definidas",
      );
    } else {
      //Enviar email de confirmación al paciente
      const patient = patientExists;

      // Verificar que tengamos los datos necesarios y que el populate haya funcionado
      if (!patient) {
        console.warn("⚠️ No se pudo enviar email: patientID es null");
      } else if (
        typeof patient === "string" ||
        patient.constructor?.name === "ObjectId"
      ) {
        console.warn("⚠️ No se pudo enviar email: patientID no está populado");
      } else if (!patient.email) {
        console.warn("⚠️ No se pudo enviar email: el paciente no tiene email");
      } else if (
        !appointmentAdded.slots ||
        appointmentAdded.slots.length === 0
      ) {
        console.warn("⚠️ No se pudo enviar email: no hay slots");
      } else {
        //enviar email
        const patientFullName = `${patient.name} ${patient.lastName}`;

        // Usar el helper de slots existente para formatear el horario
        const timeRanges = slotsToRanges(appointmentAdded.slots, "09:00", 30);
        const appointmentTime =
          timeRanges.join(", ") || "Horario no especificado";

        const emailSent = await sendAppointmentConfirmation(
          patient.email,
          patientFullName,
          appointmentAdded.date,
          appointmentTime,
        );

        if (emailSent) {
          console.log(`✉️ Email de confirmación enviado a ${patient.email}`);
        } else {
          console.warn(
            `⚠️ Error al enviar email a ${patient.email} (problema con el transporter)`,
          );
        }
      }
    }

    return this.toDTO(appointmentAdded);
  }

  /**
   * Borrar un turno
   */
  async delete(appointmentID) {
    const deletedAppointment = await super.delete(appointmentID);

    //Invalidar cache de citas de hoy si la cita eliminada es para el día actual
    const todayKey = `appointments:${dateNotHours(new Date())}`;
    const appointmentDate = dateNotHours(new Date(deletedAppointment.date));

    if (appointmentDate === dateNotHours(new Date())) {
      console.log("La cita eliminada es para hoy. Invalidando cache...");
      await this.cacheService.del(todayKey);
    }

    return this.toDTO(deletedAppointment);
  }

  /**
   * Actualizar un turno
   */
  async update(appointmentID, toUpdate) {
    const updatedAppointment = await this.repository.updateByFilter(
      { _id: appointmentID },
      toUpdate,
    );

    if (!updatedAppointment)
      throw new NotFoundError("Appointment", appointmentID);

    //Invalidar cache de citas de hoy si la cita actualizada es para el día actual
    const todayKey = `appointments:${dateNotHours(new Date())}`;
    const appointmentDate = dateNotHours(new Date(updatedAppointment.date));

    if (appointmentDate === dateNotHours(new Date())) {
      console.log("La cita actualizada es para hoy. Invalidando cache...");
      await this.cacheService.del(todayKey);
    }
    return this.toDTO(updatedAppointment);
  }

  async getAvailableAppointments(idDoctor, day) {
    // Obtener todos los turnos del doctor en la fecha dada
    const appointments = await this.repository.findManyByFilter({
      doctorID: idDoctor,
      date: new Date(day),
    });

    let success;

    if (!appointments) {
      success = false;
      return { success: false };
    }

    if (appointments && appointments.length === 0) {
      // Si no hay citas, todos los slots están disponibles
      return { success: true, data: Array.from({ length: 18 }, (_, i) => i) };
    } else {
      // Obtener todos los slots ocupados
      const occupiedSlots = appointments.reduce((acc, appointment) => {
        acc = [...acc, ...appointment.slots];
        return acc;
      }, []);
      // Con los ocupados, obtener los slots disponibles
      const availableSlots = getAvailableSlots(occupiedSlots);
      return { success: true, data: availableSlots };
    }
  }

  /**
   * Obtener los turnos disponibles más cercanos para un doctor especifico
   * @param {String} idDoctor Identificador de doctor
   * @param {Number} totalSlots Cantidad de slots disponibles del doctor
   * @returns {Object}
   */
  async getNearestAppointments(idDoctor, totalSlots = 18) {
    // Obtener la fecha actual y sumarle 1 dia
    const today = new Date();
    //setUTCHours para evitar problemas de zona horaria
    today.setUTCHours(0, 0, 0, 0); // Establecer a medianoche para comparar solo fechas
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    nextDay.setUTCHours(0, 0, 0, 0); // Establecer a medianoche para comparar solo fechas

    let dayFounded = false;

    do {
      // Obtener los turnos disponibles para el doctor en la fecha actual
      const availableAppointments = await this.getAvailableAppointments(
        idDoctor,
        nextDay,
      );

      if (
        availableAppointments.success &&
        availableAppointments.data.length > 0
      ) {
        // Si hay citas disponibles, devolver la primera encontrada
        dayFounded = true;
        //console.log("Citas disponibles encontradas para el día:", nextDay);
        return {
          success: true,
          date: nextDay,
          slots: slotsToHours(availableAppointments.data),
        };
      } else {
        // Si no hay citas, todos los slots están ocupados. Pasar al siguiente día
        nextDay.setDate(nextDay.getDate() + 1);
        //console.log("No hay citas disponibles. Buscando en el siguiente día:", nextDay);
      }
    } while (!dayFounded);
    return { success: false };
  }

  /**
   * Método para cambiar el estado de una cita a "waiting" (check-in)
  */
  async checkIn(appointmentID) {
    const appointment = await this.repository.findByFilter({ _id: appointmentID });

    if (!appointment) {
      throw new NotFoundError("Appointment", appointmentID);
    }

    if (appointment.status.toLowerCase() !== "confirmed") {
      throw new ValidationError(
        "Solo los turnos confirmados pueden pasar a espera.",
      );
    }

    const updateAppointment = await this.repository.update(appointmentID, {status: "waiting"}) 

    const appointmentDTO = this.toShortDTO(appointment);

    //Notificar al doctor. Es asincronico pero no se rompe el flujo
    void notificationService.notifyPatientWaiting(appointmentDTO);
      
    return appointmentDTO;
}
async call(appointmentID) {
    const appointment = await this.repository.findByFilter({ _id: appointmentID });

    if (!appointment) {
        throw new NotFoundError("Appointment", appointmentID);
    }

    if (appointment.status.toLowerCase() !== "waiting") {
        throw new ValidationError(
            "Solo los turnos en espera pueden ser llamados."
        );
    }

    const updatedAppointment = await this.repository.update(
        appointmentID,
        { status: "called" }
    );

    if (updatedAppointment.modifiedCount === 0) {
        throw new AppError("No se pudo actualizar el turno", 500);
    }

    appointment.status = "called";
    //Eliminar cache o invalidar contenido
    const todayKey = `appointments:${dateNotHours(new Date())}`;
    await this.cacheService.del(todayKey);
    const appointmentDTO = this.toShortDTO(appointment);

    void notificationService.notifyPatientCalled(appointmentDTO);

    return appointmentDTO;
}

async finalize(appointmentID) {
    const appointment = await this.repository.findByFilter({ _id: appointmentID });

    if (!appointment) {
        throw new NotFoundError("Appointment", appointmentID);
    }

    if (appointment.status.toLowerCase() !== "called") {
        throw new ValidationError(
            "Solo los turnos llamados pueden finalizarse."
        );
    }

    const updatedAppointment = await this.repository.update(
        appointmentID,
        { status: "finalized" }
    );

    if (updatedAppointment.modifiedCount === 0) {
        throw new AppError("No se pudo actualizar el turno", 500);
    }

    appointment.status = "finalized";
    //Eliminar cache o invalidar contenido
    const todayKey = `appointments:${dateNotHours(new Date())}`;
    await this.cacheService.del(todayKey);
    const appointmentDTO = this.toShortDTO(appointment);

    void notificationService.notifyPatientFinalized(appointmentDTO);

    return appointmentDTO;
}

  //Métodos de mapeo DTO
  toFormatDTO(appointmentData) {
    return new AppointmentDTO(appointmentData);
  }

  toDTO(appointment) {
    return AppointmentDTO.toResponse(appointment);
  }

  toShortDTO(appointment) {
    return AppointmentDTO.toShortResponse(appointment);
  }

  toManyDTO(appointments) {
    return appointments.map((appointment) =>
      AppointmentDTO.toResponse(appointment),
    );
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
