import ServiceMongo from "../../service/dbMongoService.js";
import { PatientFormated, sendPatientFormated, sendPatientsFormated } from "../DTO/patient.dto.js";
const serviceMongo = new ServiceMongo();

import { Patient } from "./model/patientsModel.js";

export default class PatientsManager {
    constructor() {}

    async getPatients() {
        const arrayPatient = await serviceMongo.getDocuments(Patient);
        return sendPatientsFormated(arrayPatient);
    }

    async getPatientById(id) {
        const patientFounded = await serviceMongo.getDocumentByID(Patient, id);
        return sendPatientFormated(patientFounded);
    }

    async getPatientByFilter(filter) {
        const patientFounded = await serviceMongo.getDocumentByFilter(Patient, filter);
        return sendPatientFormated(patientFounded);
    }

    async getPatientPaginate(dQuery, dLimit, dPage, dSort) {
        const patientsGetted = await serviceMongo.getDocumentsPaginate(Patient, dQuery, dLimit, dPage, dSort);
        if (patientsGetted) {
            patientsGetted.docs = sendPatientsFormated(patientsGetted.docs);
        }
        console.log(patientsGetted);
        return patientsGetted || false;
    }

    async createPatient(newPatient) {
        const patientFormatted = new PatientFormated(newPatient); // CORREGIDO: Ahora se usa 'new'
        const patientAdded = await serviceMongo.createDocument(Patient, patientFormatted);
        return patientAdded;
    }

    async deletePatient(patientID) {
        return serviceMongo.deleteDocument(Patient, patientID);
    }

    async updatePatient(patientID, toUpdate) {
        return serviceMongo.updateDocument(Patient, patientID, toUpdate);
    }
}
