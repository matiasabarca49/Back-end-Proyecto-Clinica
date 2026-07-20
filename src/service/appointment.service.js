import mongoose from "mongoose";
//Model
import { Appointment } from "../model/mongo/appointment.model.js"
//Base Service
import BaseService from './base.service.js'
//Patients Service
import PatientsService from './patient.service.js'
const patientsService = new PatientsService();
//Doctors Service
import DoctorsService from './doctor.service.js'
const doctorsService = new DoctorsService();
//Repository
import MongoRepository from "../repositories/implementations/mongo.repository.js";
//DTO
import { AppointmentDTO } from "../dto/appointment.dto.js";
//utils and helpers
import { determineSearchType } from "../utils/utils.js";
import { getAvailableSlots, slotsToHours, slotsToRanges } from "../utils/slots.helper.js";
import { NotFoundError, ValidationError } from "../exceptions/validations.exception.js";
import { sendAppointmentConfirmation } from "../utils/email.helpers.js";
import { validateEnvVars } from "../utils/dotenv.helper.js";
import AppError from "../exceptions/AppErrors.js";
import CacheService from "./cache/cache.service.js";
import { dateNotHours } from "../utils/dates.helper.js";

export default class AppointmentsService extends BaseService{
    constructor() {
        const repository = new MongoRepository(Appointment);
        super(repository);

        this.cacheService = new CacheService();
    }

   async findAll(){
        const appointment = await super.findAll()
        return this.toManyShortDTO(appointment)
    }

    async findById(id){
        const appointment = await super.findById(id)
        if(!appointment) throw new NotFoundError("Appointment", id)
        return this.toDTO(appointment)
    }

    async paginateAppointments(person = "", query = "", status,limit, page, sort){
        const filtersPerson = [];
        const filtersQuery = [];
        let filters = {};
        if(mongoose.Types.ObjectId.isValid(person)){
                filtersPerson.push({doctorID: person});
                filtersPerson.push({patientID: person});
                filtersPerson.push({_id: person});
        }else if( typeof person === "string" && person.length > 1){
            const searchRegex = new RegExp(person, "i");
            //Buscando Pacientes y doctores que coincidan con la persona
            const patientsFounded = await patientsService.searchPaginate(searchRegex);
            const doctorsFounded = await doctorsService.searchPaginate(searchRegex);
            //Usamos un conjunto de concidencias para un campo. En este caso [_id, _id, _id, _id]
            if (patientsFounded.docs.length > 0) {
                filtersPerson.push({ patientID: { $in: patientsFounded.docs.map(p => p.id) } });
            }
            if (doctorsFounded.docs.length > 0) {
                filtersPerson.push({ doctorID: { $in: doctorsFounded.docs.map(d => d.id) } });
            }
        }
        
        if(determineSearchType(query) === "fecha"){
           const fecha = new Date(query);

            let fechaInicio, fechaFin;

            // Caso: solo año
            if (/^\d{4}$/.test(query)) {
                fechaInicio = new Date(`${query}-01-01T00:00:00.000Z`);
                fechaFin = new Date(`${query}-12-31T23:59:59.999Z`);
            }
            // Caso: año-mes
            else if (/^\d{4}-\d{2}$/.test(query)) {
                fechaInicio = new Date(`${query}-01T00:00:00.000Z`);
                fechaFin = new Date(new Date(fechaInicio).setMonth(fechaInicio.getMonth() + 1) - 1);
            }
            // Caso: fecha completa
            else {
                fechaInicio = new Date(fecha.setHours(0,0,0,0));
                fechaFin = new Date(fecha.setHours(23,59,59,999));
            }

            filtersQuery.push({ date: { $gte: fechaInicio, $lte: fechaFin } });
            
        }else if(typeof query === "string" && query.length > 3){
            const searchRegex = new RegExp(query, "i");
            filtersQuery.push({$or: [ 
                {typeAppointment: searchRegex},
                {room: searchRegex}
            ]})
        }

        if(person && query){
            filters = {
                $and: [
                    {
                        $or: filtersPerson
                    },
                    {
                        $or: filtersQuery 
                    }
                ]}
            //status && (filters.status = status)
        }else if(!person){
            filters = filtersQuery.length > 1 ? { $or: filtersQuery } : filtersQuery[0] 
            //console.log(filters)
        }else{
            filters = filtersPerson.length > 1 ? { $or: filtersPerson } : filtersPerson[0]
        }

        if (!filters || typeof filters !== 'object') {
        filters = {};
        }

        if(status) {
            filters.status = status
        };

        switch(parseInt(sort)){
            case -1:
                sort = {date : -1 , slots: -1}
                break;
            default: 
                sort = {date : 1 , slots: 1}
                break;
        }
        
        const appointmentsFounded = await this.repository.findPaginate(filters, limit, page, sort)

        if (appointmentsFounded) {
            appointmentsFounded.docs = this.toManyShortDTO(appointmentsFounded.docs);
        }
        return appointmentsFounded || [];
    
    }

    async findToday(){
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0); // Establecer a medianoche para comparar solo fechas
            const day = today.getUTCDate().toString().padStart(2, '0');
            const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
            const year = today.getUTCFullYear();
            const todayString = `${year}-${month}-${day}`;

            //Buscar en cache
            const cachedAppointments = await this.cacheService.get(`appointments:${todayString}`);
            if (cachedAppointments) {
                console.log(`Citas de hoy ${todayString} obtenidas de cache`);
                return cachedAppointments;
            }

            const appointments = await this.repository.findPaginate({ date: todayString }, 10, 1, {date: 1, slots: 1});

            if(!appointments) throw new AppError("Error al obtener las citas de hoy", 500)

            appointments.docs = this.toManyShortDTO(appointments.docs);

            //Guardar en cache por 10 minutos
            console.log(`Guardando citas de hoy ${todayString} en cache por 10 minutos`);
            await this.cacheService.set(`appointments:${todayString}`, appointments, 600); // 600 segundos = 10 minutos

            return appointments;
    }

    async create(newAppointment) {

        const { date , doctorID, patientID, slots } = newAppointment
        
        // Verificar conflictos de horarios para el doctor y el paciente
        const turnoFounded = await this.repository.findByFilter({
            date: date,
            slots: { $in: slots },
            $or: [
                { doctorID: doctorID },      // El doctor ya tiene turno
                { patientID: patientID }      // El paciente ya tiene turno
            ]
            });

        if (turnoFounded) {
            // Determinar qué conflicto existe
            if (turnoFounded.doctorID._id.toString() === doctorID) {
                throw new ValidationError("El doctor ya tiene un turno reservado en ese horario");
            }
            if (turnoFounded.patientID._id.toString() === patientID) {
                throw new ValidationError("El paciente ya tiene un turno reservado en ese horario");
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

        if(!validateEnvVars("email")){
            console.warn("⚠️ [Info] Email de confirmación no enviado: variables de entorno para email no definidas");
        }else{
            //Enviar email de confirmación al paciente
            const patient = patientExists;
                            
            // Verificar que tengamos los datos necesarios y que el populate haya funcionado
            if (!patient) {
                console.warn("⚠️ No se pudo enviar email: patientID es null");
            } else if (typeof patient === 'string' || patient.constructor?.name === 'ObjectId') {
                console.warn("⚠️ No se pudo enviar email: patientID no está populado");
            } else if (!patient.email) {
                console.warn("⚠️ No se pudo enviar email: el paciente no tiene email");
            } else if (!appointmentAdded.slots || appointmentAdded.slots.length === 0) {
                console.warn("⚠️ No se pudo enviar email: no hay slots");
            } else {
                //enviar email
                const patientFullName = `${patient.name} ${patient.lastName}`;
                
                // Usar el helper de slots existente para formatear el horario
                const timeRanges = slotsToRanges(appointmentAdded.slots, "09:00", 30);
                const appointmentTime = timeRanges.join(", ") || "Horario no especificado";
                
                const emailSent = await sendAppointmentConfirmation(
                    patient.email,
                    patientFullName,
                    appointmentAdded.date,
                    appointmentTime
                );
                
                if (emailSent) {
                    console.log(`✉️ Email de confirmación enviado a ${patient.email}`);
                } else {
                    console.warn(`⚠️ Error al enviar email a ${patient.email} (problema con el transporter)`);
                }
    
            }
        }


        return this.toDTO(appointmentAdded)
    }

    async delete(appointmentID) {
        const deletedAppointment = await super.delete(appointmentID)

        //Invalidar cache de citas de hoy si la cita eliminada es para el día actual
        const todayKey = `appointments:${dateNotHours(new Date())}`;
        const appointmentDate = dateNotHours(new Date(deletedAppointment.date));

        if (appointmentDate === dateNotHours(new Date())) {
            console.log("La cita eliminada es para hoy. Invalidando cache...");
            await this.cacheService.del(todayKey);
        }

        return this.toDTO(deletedAppointment);
    }

    async update(appointmentID, toUpdate) {
        const updatedAppointment = await this.repository.updateByFilter({_id: appointmentID }, toUpdate);

        if(!updatedAppointment) throw new NotFoundError("Appointment", appointmentID);

        //Invalidar cache de citas de hoy si la cita actualizada es para el día actual
        const todayKey = `appointments:${dateNotHours(new Date())}`;
        const appointmentDate = dateNotHours(new Date(updatedAppointment.date));

        if (appointmentDate === dateNotHours(new Date())) {
            console.log("La cita actualizada es para hoy. Invalidando cache...");
            await this.cacheService.del(todayKey);
        }
        return this.toDTO(updatedAppointment);
    }

    async getAvailableAppointments(idDoctor, day){
        // Obtener todos los turnos del doctor en la fecha dada
        const appointments = await this.repository.findManyByFilter({
            doctorID: idDoctor,
            date: new Date(day)
        });

        let success;

        if (!appointments) {
            success = false;
            return { success: false  };
        }

        if (appointments && appointments.length === 0) {
            // Si no hay citas, todos los slots están disponibles
            return { success: true , data: Array.from({ length: 18 }, (_, i) => i) };
        } else {
            // Obtener todos los slots ocupados
            const occupiedSlots = appointments.reduce((acc, appointment) => {
                acc = [ ...acc, ...appointment.slots ];
                return acc;
            }, []);
            // Con los ocupados, obtener los slots disponibles
            const availableSlots = getAvailableSlots(occupiedSlots);
            return { success: true , data: availableSlots };
        }
    }

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
            const availableAppointments = await this.getAvailableAppointments(idDoctor, nextDay);
    
            //console.log("availableAppointments:", availableAppointments);
    
            if (availableAppointments.success && availableAppointments.data.length > 0) {
                // Si hay citas disponibles, devolver la primera encontrada
                dayFounded = true;
                //console.log("Citas disponibles encontradas para el día:", nextDay);
                return { success: true, date: nextDay, slots: slotsToHours(availableAppointments.data) };
            }else {
                // Si no hay citas, todos los slots están ocupados. Pasar al siguiente día
                nextDay.setDate(nextDay.getDate() + 1);
                //console.log("No hay citas disponibles. Buscando en el siguiente día:", nextDay);
            }

        } while (!dayFounded);
        return { success: false  };
    } 

    //Métodos de mapeo DTO
    toFormatDTO(appointmentData) {
        return new AppointmentDTO(appointmentData)
    }

    toDTO(appointment) {
        return AppointmentDTO.toResponse(appointment)
    }

    toShortDTO(appointment) {
        return AppointmentDTO.toShortResponse(appointment)
    }

    toManyDTO(appointments) {
        return appointments.map(appointment => AppointmentDTO.toResponse(appointment));
    }

    toManyShortDTO(appointments) {
        return appointments
                    .filter(appointment => (appointment.patientID !== null && appointment.doctorID !== null))
                    .map(appointment => AppointmentDTO.toShortResponse(appointment));
    }

}