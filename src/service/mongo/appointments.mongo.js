import PersistController from "../../DAO/persistController.js";
import { sendAppointmentFormated, AppointmentFormated, sendAppointmentsFormated } from "../../dto/appointment.dto.js";
import { Appointment } from "../../model/mongo/appointmentsModel.js";

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
