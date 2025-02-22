import ServiceMongo from "../../service/dbMongoService.js";
const serviceMongo = new ServiceMongo();

import { Treatment } from "./model/treatmentsModel.js";

export default class TreatmentsManager {
    constructor() {}

    async getTreatments() {
        const treatments = await serviceMongo.getDocuments(Treatment);
        return treatments;
    }

    async getTreatmentById(id) {
        const treatment = await serviceMongo.getDocumentByID(Treatment, id);
        return treatment;
    }

    async getTreatmentByFilter(filter) {
        const treatments = await serviceMongo.getDocumentByFilter(Treatment, filter);
        return treatments;
    }

    async getTreatmentPaginate(query, limit, page, sort) {
        const treatments = await serviceMongo.getDocumentsPaginate(Treatment, query, limit, page, sort);
        return treatments;
    }

    async createTreatment(newTreatment) {
        const treatmentAdded = await serviceMongo.createDocument(Treatment, newTreatment);
        return treatmentAdded;
    }

    async deleteTreatment(treatmentID) {
        return serviceMongo.deleteDocument(Treatment, treatmentID);
    }

    async updateTreatment(treatmentID, toUpdate) {
        return serviceMongo.updateDocument(Treatment, treatmentID, toUpdate);
    }
}
