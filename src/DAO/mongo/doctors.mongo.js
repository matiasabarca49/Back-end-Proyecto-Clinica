import ServiceMongo from "../../service/dbMongoService.js";
const serviceMongo = new ServiceMongo();

import { Doctor } from "./model/doctorsModel.js";

export default class DoctorsManager{
    constructor (){

    }

    async getDoctors(){
        const arrayDoctor = await serviceMongo.getDocuments(Doctor);
        return arrayDoctor;
    }
    async getDoctorById(id){
        const doctorFounded = await serviceMongo.getDocumentByID(Doctor, id);
        return doctorFounded;
    }
    async getDoctorByFilter(filter){
        const doctorFounded = await serviceMongo.getDocumentByFilter(Doctor,filter);
        return doctorFounded;
    }
    async createDoctor(newDoctor){
        const DoctorAdded = await serviceMongo.createDocument(Doctor, newDoctor);
        return newDoctor;
    }
    async deleteDoctor(doctorID){
        return serviceMongo.deleteDocument(Doctor, doctorID);
    }
    async updateDoctor(doctorID, toUpdate){
        return serviceMongo.updateDocument(Doctor, doctorID, toUpdate);
    }

}
