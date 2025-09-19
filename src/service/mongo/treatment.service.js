import PersistController from "../../DAO/persistController.js";
import { sendTreatmentFormated, TreatmentFormated, sendTreatmentsFormated } from "../../dto/treatment.dto.js";
import { Treatment } from "../../model/mongo/treatment.model.js";

const persistController = new PersistController();

export default class TreatmentsService {
    constructor() {}

    async getTreatments() {
        const treatments = await persistController.getDocuments(Treatment);
        return sendTreatmentsFormated(treatments);
    }

    async getTreatmentById(id) {
        const treatmentFound = await persistController.getDocumentByID(Treatment, id);
        return treatmentFound ? sendTreatmentFormated(treatmentFound) : false;
    }

    async getAllTreatmentById(id) {
        const treatmentFound = await persistController.getDocumentByID(Treatment, id);
        return treatmentFound || false;
    }

    async getTreatmentsPaginate(query, limit, page, sort) {
        const treatments = await persistController.getDocumentsPaginate(Treatment, query, limit, page, sort);
        if (treatments) {
            treatments.docs = sendTreatmentsFormated(treatments.docs);
        }
        return treatments || false;
    }

    async getTreatmentsByFilter(filter) {
        const treatmentsFounded = await persistController.getDocumentByFilter(Treatment, filter);
        return treatmentsFounded || false;
    }

    async getTreatmentByFilter(filter) {
        const treatmentFounded = await persistController.getDocumentByFilter(Treatment, filter);
        return treatmentFounded ? sendTreatmentFormated(treatmentFounded) : false;
    }

    async createTreatment(newTreatment) {
        const newTreatmentFormated = new TreatmentFormated(newTreatment);
        const treatmentAdded = await persistController.createDocument(Treatment, newTreatmentFormated);
        return treatmentAdded
            ? { ...treatmentAdded, dt: sendTreatmentFormated(treatmentAdded.dt) }
            : treatmentAdded;
    }

    deleteTreatment(treatmentID) {
        return persistController.deleteDocument(Treatment, treatmentID);
    }

    updateTreatment(treatmentID, toUpdate) {
        return persistController.updateDocument(Treatment, treatmentID, toUpdate);
    }
}
