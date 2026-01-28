import mongoose from "mongoose";
//Model
import { Appointment } from "../model/mongo/appointment.model.js"
//Base Service
import BaseService from './base.service.js'
//Patients Service
import PatientsService from './mongo/patient.service.js'
const patientsService = new PatientsService();
//Doctors Service
import DoctorsService from './mongo/doctor.service.js'
const doctorsService = new DoctorsService();
//Repository
import MongoRepository from "../repositories/implementations/mongo.repository.js";
//DTO
import { AppointmentDTO } from "../dto/appointment.dto.js";
//utils and helpers
import { determineSearchType } from "../utils/utils.js";
import { getAvailableSlots, slotsToHours } from "../utils/slots.helper.js";

export default class AppointmentsService extends BaseService{
    constructor() {
        const repository = new MongoRepository(Appointment);
        super(repository);
    }

   async findAll(){
        const appointment = await super.findAll()
        if(!appointment) throw new Error('Error interno del servidor')
        return this.toManyDTO(appointment)
    }

    async findByFilter(filter){
        //Repository
        const appointment = await super.findByFilter(filter)
        return appointment ? this.toDTO(appointment) : undefined
        
    }

    async findManyByFilter(filter){
        const appointment = await super.findManyByFilter(filter) 
        return this.toManyDTO(appointment)
    }

    async findByFilterOrFail(filter){
        const appointment =  await super.findByFilter(filter)
        if(!appointment) throw new Error('Turno no encontrado')
        return this.toDTO(appointment)
    }

    async findById(id){
        const appointment = await super.findById(id)
        if(!appointment) throw new Error('Turno no encontrado')
        return this.toDTO(appointment)
    }

    async findPaginate(dftQuery, dftLimit, dftPage, dftSort){
        const resultPaginate = await super.findPaginate(dftQuery, dftLimit, dftPage, dftSort)
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    async findByQuery(person, query, status,limit, page, sort){
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
            const patientsFounded = await patientsService.getPatientByQuery(searchRegex); //Cambiar por nuevo servicio
            const doctorsFounded = await doctorsService.getDoctorByQuery(searchRegex); // Cambiar por nuevo servicio
            //Usamos un conjunto de concidencias para un campo. En este caso [_id, _id, _id, _id]
            if (patientsFounded.docs.length > 0) {
                filtersPerson.push({ patientID: { $in: patientsFounded.docs.map(p => p._id) } });
            }
            if (doctorsFounded.docs.length > 0) {
                filtersPerson.push({ doctorID: { $in: doctorsFounded.docs.map(d => d._id) } });
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
        
        const appointmentsFounded = await super.findPaginate(filters, limit, page, sort)

        if (appointmentsFounded) {
            appointmentsFounded.docs = this.toManyDTO(appointmentsFounded.docs);
        }
        return appointmentsFounded || [];
    
    }

    async createAppointment(newAppointment) {

        const { date , doctorID, patientID, slots } = newAppointment
        
        // Verificar conflictos de horarios para el doctor y el paciente
        const turnoFounded = await super.findByFilter({
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
                throw new Error("El doctor ya tiene un turno reservado en ese horario");
            }
            if (turnoFounded.patientID._id.toString() === patientID) {
                throw new Error("El paciente ya tiene un turno reservado en ese horario");
            }
        }

        //Corroborrar que el doctor y paciente existan
        const doctorExists = await doctorsService.findById(doctorID);
        if (!doctorExists) {
            throw new Error("El doctor especificado no existe");
        }

        const patientExists = await patientsService.findById(patientID);
        if (!patientExists) {
            throw new Error("El paciente especificado no existe");
        }
        
        // Crear la nueva cita
        // Asignar fechas de creación y última modificación
        newAppointment.created = new Date();
        newAppointment.lastChange = new Date();
        const newAppointmentFormated = new AppointmentDTO(newAppointment);
        const appointmentAdded = await super.create(newAppointmentFormated);

        if (!appointmentAdded) {
            throw new Error("Error al crear la cita");
        }

        return appointmentAdded
    }

    delete(appointmentID) {
        return super.delete(appointmentID);
    }

    update(appointmentID, toUpdate) {
        toUpdate.lastChange = new Date()
        return super.update(appointmentID, toUpdate);
    }

    async getAvailableAppointments(idDoctor, day){
        // Obtener todos los turnos del doctor en la fecha dada
        const appointments = await super.findManyByFilter({
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

        /* console.log("today:", today);
        console.log("nextDay:", nextDay); */

        
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

    toManyDTO(appointments) {
        return appointments.map(appointment => AppointmentDTO.toResponse(appointment));
    }

}