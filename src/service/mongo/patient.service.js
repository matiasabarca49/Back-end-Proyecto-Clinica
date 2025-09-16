import PersistController from "../../DAO/persistController.js";
import { sendPatientFormated, PatientFormated, sendPatientsFormated } from "../../dto/patient.dto.js";
import { Patient } from "../../model/mongo/patientsModel.js";
import { normalizeText } from "../../utils/utils.js";

const persistController = new PersistController();

export default class PatientsService {
    constructor() {}

    async getPatients(user) {
        let arrayPatient;
        if(user.rol === "Doctor"){
            arrayPatient = await persistController.getDocumentsByFilter(Patient, {idDoctor: user.id})
        }else{
            arrayPatient = await persistController.getDocuments(Patient);
        }
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

    async getPatientPaginate(dQuery, dLimit, dPage, dSort, user) {
        let patientsGetted;
        if(user.rol === "Doctor"){
            patientsGetted = await persistController.getDocumentsPaginate(Patient, dQuery, dLimit, dPage, dSort, user.id);
        }else{
            patientsGetted = await persistController.getDocumentsPaginate(Patient, dQuery, dLimit, dPage, dSort);
        }
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

    async createPatient(newPatient, user) {

        const patientNormalized = {
            ...newPatient,
            name: normalizeText(newPatient.name),
            lastName: normalizeText(newPatient.lastName),
            sex: normalizeText(newPatient.sex),
            idDoctor: user.rol === "Doctor" ?  user.id  :  newPatient.idDoctor
        }

        const patientFormatted = new PatientFormated(patientNormalized);
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
