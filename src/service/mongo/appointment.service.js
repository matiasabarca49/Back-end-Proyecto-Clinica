import mongoose from "mongoose";
import PersistController from "../../DAO/persistController.js";
import { sendAppointmentFormated, AppointmentFormated, sendAppointmentsFormated } from "../../dto/appointment.dto.js";
import { Appointment } from "../../model/mongo/appointmentsModel.js";
//Patients
import PatientsService from './patient.service.js'
const patientsService = new PatientsService();
//Doctors
import DoctorsService from './doctor.service.js'
import { determineSearchType } from "../../utils/utils.js";
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

        return persistController.getDocumentByQuery(Appointment, filters, limit, page, sort)
    }

    async createAppointment(newAppointment) {

        const { date , idDoctor, slots } = newAppointment
        //Verificar si el turno existe
        
        const turnoFounded = await persistController.getDocumentByFilter(Appointment, 
            {date: date, idDoctor: idDoctor, slots: { $in: slots }})
        if (turnoFounded){
            throw new Error(`El slot ya está reservado para ese día`);
        }
        

        const newAppointmentFormated = new AppointmentFormated(newAppointment);
        const appointmentAdded = await persistController.createDocument(Appointment, newAppointmentFormated);
        return appointmentAdded.status
            ? { ...appointmentAdded, dt: sendAppointmentFormated(appointmentAdded.dt) }
            : appointmentAdded;
    }

    deleteAppointment(appointmentID) {
        return persistController.deleteDocument(Appointment, appointmentID);
    }

    updateAppointment(appointmentID, toUpdate) {
        return persistController.updateDocument(Appointment, appointmentID, toUpdate);
    }
}
