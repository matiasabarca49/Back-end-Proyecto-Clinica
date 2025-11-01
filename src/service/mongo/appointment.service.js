import mongoose from "mongoose";
import PersistController from "../../DAO/persistController.js";
import { sendAppointmentFormated, AppointmentFormated, sendAppointmentsFormated } from "../../dto/appointment.dto.js";
import { Appointment } from "../../model/mongo/appointment.model.js"
//Patients
import PatientsService from './patient.service.js'
const patientsService = new PatientsService();
//Doctors
import DoctorsService from './doctor.service.js'
import { determineSearchType } from "../../utils/utils.js";
import { getAvailableSlots, slotsToHours } from "../../utils/slots.helper.js";
import e from "express";
const doctorsService = new DoctorsService();


const persistController = new PersistController();

export default class AppointmentsService {
    constructor() {}

    async getAppointments() {
        const arrayAppointments = await persistController.getDocuments(Appointment);
        return sendAppointmentsFormated(arrayAppointments);
    }

    async getAppointmentById(id) {
        const appointmentFound = await persistController.getDocumentByID(Appointment, id);
        return appointmentFound ? sendAppointmentFormated(appointmentFound) : false;
    }

    async getAllAppointmentById(id) {
        const appointmentFound = await persistController.getDocumentByID(Appointment, id);
        return appointmentFound || false;
    }

    async getAppointmentsPaginate(dQuery, dLimit, dPage, dSort) {
        const appointmentsGetted = await persistController.getDocumentsPaginate(Appointment, dQuery, dLimit, dPage, dSort);
        if (appointmentsGetted) {
            appointmentsGetted.docs = sendAppointmentsFormated(appointmentsGetted.docs);
        }
        return appointmentsGetted || false;
    }

    async getAppointmentsByFilter(filter) {
        const appointmentsFounded = await persistController.getDocumentByFilter(Appointment, filter);
        return appointmentsFounded || false;
    }

    async getAppointmentByFilter(filter) {
        const appointmentFounded = await persistController.getDocumentByFilter(Appointment, filter);
        return appointmentFounded ? sendAppointmentFormated(appointmentFounded) : false;
    }

    async getAppointmentByQuery(person, query, status,limit, page, sort){
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
            const patientsFounded = await patientsService.getPatientByQuery(searchRegex);
            const doctorsFounded = await doctorsService.getDoctorByQuery(searchRegex);
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
        
        const appointmentsFounded = await persistController.getDocumentByQuery(Appointment, filters, limit, page, sort)

        if (appointmentsFounded) {
            appointmentsFounded.docs = sendAppointmentsFormated(appointmentsFounded.docs);
        }
        return appointmentsFounded || false;
    
    }

    async createAppointment(newAppointment) {

        const { date , doctorID, patientID, slots } = newAppointment
        //Verificar si el turno existe
        /* const turnoFounded = await persistController.getDocumentByFilter(Appointment, 
            {date: date, doctorID: doctorID, slots: { $in: slots }})
        if (turnoFounded){
            throw new Error(`El slot ya está reservado para ese día`);
        } */

        const turnoFounded = await persistController.getDocumentByFilter(Appointment, {
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
                return {status: false, error: {code: "a1b2c3d4e5f6", message: "El doctor ya tiene un turno reservado en ese horario" }};
            }
            if (turnoFounded.patientID._id.toString() === patientID) {
                return {status: false, error: {code: "a1b2c3d4e5f6", message: "El paciente ya tiene un turno reservado en ese horario" }};
            }
        }
        

        const newAppointmentFormated = new AppointmentFormated(newAppointment);
        const appointmentAdded = await persistController.createDocument(Appointment, newAppointmentFormated);
        
        // 🆕 POPULATE: Obtener el appointment con datos completos de paciente y doctor
        if (appointmentAdded.status && appointmentAdded.dt && appointmentAdded.dt._id) {
            const appointmentWithPopulate = await Appointment.findById(appointmentAdded.dt._id)
                .populate('patientID')
                .populate('doctorID');
            
            return appointmentAdded.status
                ? { ...appointmentAdded, dt: sendAppointmentFormated(appointmentWithPopulate) }
                : appointmentAdded;
        }
        
        return appointmentAdded.status
            ? { ...appointmentAdded, dt: sendAppointmentFormated(appointmentAdded.dt) }
            : appointmentAdded;
    }

    deleteAppointment(appointmentID) {
        return persistController.deleteDocument(Appointment, appointmentID);
    }

    updateAppointment(appointmentID, toUpdate) {
        toUpdate.lastChange = new Date()
        return persistController.updateDocument(Appointment, appointmentID, toUpdate);
    }


    async getAvailableAppointments(idDoctor, day){
        /* console.log("idDoctor:", idDoctor);
        console.log("day:", day); */

        // Obtener todos los turnos del doctor en la fecha dada
        const appointments = await persistController.getAllDocumentByQuery(Appointment, {
            doctorID: idDoctor,
            date: new Date(day)
        });

        //console.log("total appointments:", appointments);

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
            //console.log("occupied slots:", occupiedSlots);
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



}