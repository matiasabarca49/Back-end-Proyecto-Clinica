import ServiceMongo from "../../service/dbMongoService.js";
import { sendAppointmentFormated, AppointmentFormated, sendAppointmentsFormated } from "../DTO/appointment.dto.js";
const serviceMongo = new ServiceMongo();

import { Appointment } from "./model/appointmentsModel.js";

export default class AppointmentsManager {
    constructor() {}

    async getAppointments() {
        const arrayAppointments = await serviceMongo.getDocuments(Appointment);
        return sendAppointmentsFormated(arrayAppointments);
    }

    async getAppointmentById(id) {
        const appointmentFound = await serviceMongo.getDocumentByID(Appointment, id);
        return appointmentFound ? sendAppointmentFormated(appointmentFound) : false;
    }

    async getAllAppointmentById(id) {
        const appointmentFound = await serviceMongo.getDocumentByID(Appointment, id);
        return appointmentFound ? appointmentFound : false;
    }

    async getAppointmentsPaginate(dQuery, dLimit, dPage, dSort) {
        const appointmentsGetted = await serviceMongo.getDocumentsPaginate(Appointment, dQuery, dLimit, dPage, dSort);
        appointmentsGetted && (appointmentsGetted.docs = sendAppointmentsFormated(appointmentsGetted.docs));
        console.log(appointmentsGetted);
        return appointmentsGetted ? appointmentsGetted : false;
    }

    async getAppointmentsByFilter(filter) {
        const appointmentsFound = await serviceMongo.getDocumentByFilter(Appointment, filter);
        return appointmentsFound ? appointmentsFound : false;
    }

    async getAppointmentByFilter(filter) {
        const appointmentFound = await serviceMongo.getDocumentByFilter(Appointment, filter);
        return appointmentFound ? sendAppointmentFormated(appointmentFound) : false;
    }

    async createAppointment(newAppointment) {
        const newAppointmentFormated = new AppointmentFormated(newAppointment);
        const appointmentAdded = await serviceMongo.createDocument(Appointment, newAppointmentFormated);
        if (appointmentAdded) {
            return newAppointmentFormated.sendAppointment();
        } else {
            return false;
        }
    }

    deleteAppointment(appointmentID) {
        return serviceMongo.deleteDocument(Appointment, appointmentID);
    }

    updateAppointment(appointmentID, toUpdate) {
        return serviceMongo.updateDocument(Appointment, appointmentID, toUpdate);
    }
}
