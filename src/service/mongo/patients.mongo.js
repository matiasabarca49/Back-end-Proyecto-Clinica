import PersistController from "../../DAO/persistController.js";
import { sendPatientFormated, PatientFormated, sendPatientsFormated } from "../../dto/patient.dto.js";
import { Patient } from "../../model/mongo/patientsModel.js";

const persistController = new PersistController();

export default class PatientsService {
    constructor() {}

    async getPatients() {
        const arrayPatient = await persistController.getDocuments(Patient);
        return sendPatientsFormated(arrayPatient);
    }

    async getPatientById(id) {
        const patientFounded = await persistController.getDocumentByID(Patient, id);
        return patientFounded ? sendPatientFormated(patientFounded) : false;
    }

    async getPatientByFilter(filter) {
        const patientFounded = await persistController.getDocumentByFilter(Patient, filter);
        return patientFounded ? sendPatientFormated(patientFounded) : false;
    }

    async getPatientPaginate(dQuery, dLimit, dPage, dSort) {
        const patientsGetted = await persistController.getDocumentsPaginate(Patient, dQuery, dLimit, dPage, dSort);
        if (patientsGetted) {
            patientsGetted.docs = sendPatientsFormated(patientsGetted.docs);
        }
        return patientsGetted ? patientsGetted : false;
    }

    async getPatientByQuery(query){
        const searchRegex = new RegExp(query, 'i')
        return persistController.getDocumentByQuery(Patient, {
            $or:[
                {name: searchRegex},
                {lastName: searchRegex},
                {email: searchRegex},
                {DNI: searchRegex}
            ]
        })
    }

    async createPatient(newPatient) {
        const patientFormatted = new PatientFormated(newPatient);
        const patientAdded = await persistController.createDocument(Patient, patientFormatted);
        if (patientAdded.status) {
            return { ...patientAdded, dt: sendPatientFormated(patientAdded.dt) };
        } else {
            return patientAdded;
        }
    }

    deletePatient(patientID) {
        return persistController.deleteDocument(Patient, patientID);
    }

    updatePatient(patientID, toUpdate) {
        return persistController.updateDocument(Patient, patientID, toUpdate);
    }
}
