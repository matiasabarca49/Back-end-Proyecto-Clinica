import ServiceMongo from "../../service/dbMongoService.js";
const serviceMongo = new ServiceMongo();

import { Patient } from "./model/patientsModel.js";

export default class PatientsManager{
    constructor (){

    }

    async getPatients(){
        const arrayPatient = await serviceMongo.getDocuments(Patient);
        return arrayPatient;
    }
    async getPatientById(id){
        const patientFounded = await serviceMongo.getDocumentByID(Patient, id);
        return patientFounded;
    }
    async createPatient(newPatient){
        const PatientAdded = await serviceMongo.createDocument(Patient, newPatient);
        return PatientAdded;
    } 
}
