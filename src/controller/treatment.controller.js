import treatmentsManager from "../DAO/mongo/treatments.mongo.js";
const treatmentManager = new treatmentsManager();

export const getTreatments = async (req, res) => {
    const treatmentsGetted = await treatmentManager.getTreatments();
    treatmentsGetted
        ? res.status(200).send({ status: "Success", treatments: treatmentsGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getTreatmentByID = async (req, res) => {
    const treatmentID = req.params.id;
    const treatmentGetted = await treatmentManager.getTreatmentById(treatmentID);
    treatmentGetted
        ? res.status(200).send({ status: "Success", treatments: treatmentGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getTreatmentByFilter = async (req, res) => {
    const filter = req.query;
    const treatmentGetted = await treatmentManager.getTreatmentByFilter(filter);
    treatmentGetted
        ? res.status(200).send({ status: "Success", treatments: treatmentGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getTreatmentsPaginate = async (req, res) => {
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    console.log(req.query);
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = { lastName: parseInt(sort) });
    search.length !== 0
        ? (defaultQuery = { lastName: search })
        : query !== "0" && (defaultQuery = { role: query });
    const treatmentsGetted = await treatmentManager.getTreatmentPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort);
    console.log(treatmentsGetted);
    treatmentsGetted
        ? res.status(200).send({ status: "Success", treatments: treatmentsGetted })
        : res.status(500).send({ status: "ERROR" });
};

export const createTreatment = async (req, res) => {
    const treatment = req.body;
    const treatmentCreated = await treatmentManager.createTreatment(treatment);
    treatmentCreated
        ? res.status(201).send({ status: "Success", treatments: treatmentCreated })
        : res.status(404).send({ status: "ERROR" });
};

export const deleteTreatment = async (req, res) => {
    const treatmentID = req.params.id;
    const treatmentDeleted = await treatmentManager.deleteTreatment(treatmentID);
    treatmentDeleted
        ? res.status(200).send({ status: "Success", treatments: treatmentDeleted })
        : res.status(404).send({ status: "ERROR" });
};

export const updateTreatment = async (req, res) => {
    const treatmentData = req.body;
    const idTreatment = req.params.id;
    console.log(treatmentData);
    
    const treatmentUpdated = await treatmentManager.updateTreatment(idTreatment, treatmentData);
    console.log(treatmentUpdated);
    treatmentUpdated
        ? res.status(201).send({ status: "Success", treatments: treatmentUpdated })
        : res.status(404).send({ status: "ERROR" });
};
