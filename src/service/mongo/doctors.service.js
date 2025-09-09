import PersistController from "../../DAO/persistController.js";
import { sendDoctorFormated, DoctorFormated, sendDoctorsFormated } from "../../dto/doctor.dto.js";
import { Doctor } from "../../model/mongo/doctorsModel.js";

const persistController = new PersistController();

export default class DoctorsService {
    constructor() {}

    async getDoctors() {
        const arrayDoctors = await persistController.getDocuments(Doctor);
        return sendDoctorsFormated(arrayDoctors);
    }

    async getDoctorById(id) {
        const doctorFound = await persistController.getDocumentByID(Doctor, id);
        return doctorFound ? sendDoctorFormated(doctorFound) : false;
    }

    async getAllDoctorById(id) {
        const doctorFound = await persistController.getDocumentByID(Doctor, id);
        return doctorFound || false;
    }

    async getDoctorsPaginate(dQuery, dLimit, dPage, dSort) {
        const doctorsGetted = await persistController.getDocumentsPaginate(Doctor, dQuery, dLimit, dPage, dSort);
        if (doctorsGetted) {
            doctorsGetted.docs = sendDoctorsFormated(doctorsGetted.docs);
        }
        return doctorsGetted || false;
    }

    async getDoctorsByFilter(filter) {
        const doctorsFounded = await persistController.getDocumentByFilter(Doctor, filter);
        return doctorsFounded || false;
    }

    async getDoctorByFilter(filter) {
        const doctorFounded = await persistController.getDocumentByFilter(Doctor, filter);
        return doctorFounded ? sendDoctorFormated(doctorFounded) : false;
    }

    async getDoctorByQuery(query){
        const searchRegex = new RegExp(query, 'i')
        return persistController.getDocumentByQuery(Doctor, {
            $or:[
                {name: searchRegex},
                {name_search: searchRegex},
                {lastName: searchRegex},
                {dni: searchRegex},
                {professionalLicense: searchRegex}
            ]
        })
    }

    async createDoctor(newDoctor) {
        const newDoctorFormated = new DoctorFormated(newDoctor);
        const doctorAdded = await persistController.createDocument(Doctor, newDoctorFormated);
        return doctorAdded
            ? { ...doctorAdded, dt: sendDoctorFormated(doctorAdded.dt) }
            : doctorAdded;
    }

    deleteDoctor(doctorID) {
        return persistController.deleteDocument(Doctor, doctorID);
    }

    updateDoctor(doctorID, toUpdate) {
        return persistController.updateDocument(Doctor, doctorID, toUpdate);
    }
}
