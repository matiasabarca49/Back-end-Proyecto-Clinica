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

}
