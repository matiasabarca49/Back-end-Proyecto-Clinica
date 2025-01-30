import ServiceMongo from "../../service/dbMongoService.js";
const serviceMongo = new ServiceMongo();

import { Appointment } from "./model/appointmentsModel.js";

export default class AppointmentsManager {
    constructor() {}

    async getAppointments() {
        const arrayAppointments = await serviceMongo.getDocuments(Appointment);
        return arrayAppointments;
    }

    async getAppointmentById(id) {
        const appointmentFound = await serviceMongo.getDocumentByID(Appointment, id);
        return appointmentFound;
    }

    async getAppointmentsByFilter(filter) {
        const appointmentsFound = await serviceMongo.getDocumentByFilter(Appointment, filter);
        return appointmentsFound;
    }

    async createAppointment(newAppointment) {
        const appointmentAdded = await serviceMongo.createDocument(Appointment, newAppointment);
        return appointmentAdded;
    }

    async deleteAppointment(appointmentID) {
        return serviceMongo.deleteDocument(Appointment, appointmentID);
    }

    async updateAppointment(appointmentID, toUpdate) {
        return serviceMongo.updateDocument(Appointment, appointmentID, toUpdate);
    }
}
