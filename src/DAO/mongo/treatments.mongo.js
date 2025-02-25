import ServiceMongo from "../../service/dbMongoService.js";
import { sendTreatmentFormated, TreatmentFormated, sendTreatmentsFormated } from "../DTO/treatment.dto.js";
const serviceMongo = new ServiceMongo();
import { Treatment } from "./model/treatmentsModel.js";

export default class TreatmentsManager {
    constructor() {}

    async getTreatments() {
        const treatments = await serviceMongo.getDocuments(Treatment);
        return sendTreatmentsFormated(treatments);
    }

    async getTreatmentById(id) {
        const treatment = await serviceMongo.getDocumentByID(Treatment, id);
        return treatment ? sendTreatmentFormated(treatment) : false;
    }

    async getAllTreatmentById(id) {
        const treatment = await serviceMongo.getDocumentByID(Treatment, id);
        return treatment ? treatment : false;
    }

    async getTreatmentByFilter(filter) {
        const treatments = await serviceMongo.getDocumentByFilter(Treatment, filter);
        return treatments ? sendTreatmentFormated(treatments) : false;
    }

    async getTreatmentPaginate(query, limit, page, sort) {
        const treatments = await serviceMongo.getDocumentsPaginate(Treatment, query, limit, page, sort);
        treatments && (treatments.docs = sendTreatmentsFormated(treatments.docs));
        return treatments ? treatments : false;
    }

    async createTreatment(newTreatment) {
        const newTreatmentFormated = new TreatmentFormated(newTreatment);
        const treatmentAdded = await serviceMongo.createDocument(Treatment, newTreatmentFormated);
        return treatmentAdded ? newTreatmentFormated.sendTreatment() : false;
    }

    async deleteTreatment(treatmentID) {
        return serviceMongo.deleteDocument(Treatment, treatmentID);
    }

    async updateTreatment(treatmentID, toUpdate) {
        return serviceMongo.updateDocument(Treatment, treatmentID, toUpdate);
    }
}
