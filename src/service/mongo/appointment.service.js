import mongoose from "mongoose";
import PersistController from "../../DAO/persistController.js";
import { sendAppointmentFormated, AppointmentFormated, sendAppointmentsFormated } from "../../dto/appointment.dto.js";
import { Appointment } from "../../model/mongo/appointmentsModel.js";
//Patients
import PatientsService from './patient.service.js'
const patientsService = new PatientsService();
//Doctors
import DoctorsService from './doctor.service.js'
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

    async getAppointmentByQuery(query){
        const filters = [];
        if(mongoose.Types.ObjectId.isValid(query)){
                filters.push({doctorID: query});
                filters.push({patientID: query});
                filters.push({_id: query});
        }else if(!isNaN(Date.parse(query))){

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

            filters.push({ date: { $gte: fechaInicio, $lte: fechaFin } });

        }else if( typeof query === "string" && query.length > 1){
            const searchRegex = new RegExp(query, "i");
            //Buscando Pacientes y doctores que coincidan con la query
            const patientsFounded = await patientsService.getPatientByQuery(searchRegex);
            const doctorsFounded = await doctorsService.getDoctorByQuery(searchRegex);
            console.log(doctorsFounded)
            //Usamos un conjunto de concidencias para un campo. En este caso [_id, _id, _id, _id]
            if (patientsFounded.length > 0) {
                filters.push({ patientID: { $in: patientsFounded.map(p => p._id) } });
            }
             if (doctorsFounded.length > 0) {
                filters.push({ doctorID: { $in: doctorsFounded.map(d => d._id) } });
            }
        }
        
        return persistController.getDocumentByQuery(Appointment, {
            $or: filters
        })
    }

    async createAppointment(newAppointment) {
        const newAppointmentFormated = new AppointmentFormated(newAppointment);
        const appointmentAdded = await persistController.createDocument(Appointment, newAppointmentFormated);
        return appointmentAdded
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
