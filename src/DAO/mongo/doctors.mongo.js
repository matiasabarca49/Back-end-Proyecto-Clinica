import ServiceMongo from "../../service/dbMongoService.js";
import { sendDoctorFormated, DoctorFormated, sendDoctorsFormated } from "../DTO/doctor.dto.js";
const serviceMongo = new ServiceMongo();

import { Doctor } from "./model/doctorsModel.js";

export default class DoctorsManager {
    constructor() {}

    async getDoctors() {
        const arrayDoctor = await serviceMongo.getDocuments(Doctor);
        return sendDoctorsFormated(arrayDoctor);
    }

    async getDoctorById(id) {
        const doctorFounded = await serviceMongo.getDocumentByID(Doctor, id);
        return doctorFounded ? sendDoctorFormated(doctorFounded) : false;
    }

    async getAllDoctorById(id) {
        const doctorFounded = await serviceMongo.getDocumentByID(Doctor, id);
        return doctorFounded ? doctorFounded : false;
    }

    async getDoctorPaginate(dQuery, dLimit, dPage, dSort) {
        const doctorsGetted = await serviceMongo.getDocumentsPaginate(Doctor, dQuery, dLimit, dPage, dSort);
        doctorsGetted && (doctorsGetted.docs = sendDoctorsFormated(doctorsGetted.docs));
        return doctorsGetted ? doctorsGetted : false;
    }

    async getAllDoctorByFilter(filter) {
        const doctorFounded = await serviceMongo.getDocumentByFilter(Doctor, filter);
        return doctorFounded ? doctorFounded : false;
    }

    async getDoctorByFilter(filter) {
        const doctorFounded = await serviceMongo.getDocumentByFilter(Doctor, filter);
        return doctorFounded ? sendDoctorFormated(doctorFounded) : false;
    }

    async createDoctor(newDoctor) {
        const newDoctorFormated = new DoctorFormated(newDoctor);
        const doctorAdded = await serviceMongo.createDocument(Doctor, newDoctorFormated);
        return doctorAdded ? newDoctorFormated.sendDoctor() : false;
    }

    deleteDoctor(doctorID) {
        return serviceMongo.deleteDocument(Doctor, doctorID);
    }

    updateDoctor(doctorID, toUpdate) {
        return serviceMongo.updateDocument(Doctor, doctorID, toUpdate);
    }
}
