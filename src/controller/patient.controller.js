import { Query } from "mongoose";
import PatientsService from "../service/mongo/patients.service.js";
const patientsService = new PatientsService();

export const getPatients = async (req, res) => {
    try {
        const patientsGetted = await patientsService.getPatients(req.user);
        patientsGetted
            ? res.status(200).send({ status: "Success", patients: patientsGetted })
            : res.status(404).send({ status: "ERROR", reason: "Los Pacientes no se pudieron obtener" });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
    
};

export const getPatientById = async (req, res) => {
    const patientID = req.params.id.trim();
    const patientGetted = await patientsService.getPatientById(patientID);
    patientGetted
        ? res.status(200).send({ status: "Success", patients: patientGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getPatientByFilter = async (req, res) => {
    const filter = req.query;
    const patientGetted = await patientsService.getPatientByFilter(filter);
    patientGetted
        ? res.status(200).send({ status: "Success", patients: patientGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getsPatientsPaginate = async (req, res) => {
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = { lastName: parseInt(sort) });
    search.length !== 0
        ? (defaultQuery = { lastName: search })
        : query !== "0" && (defaultQuery = { sex: query });
    try {
        const patientsGetted = await patientsService.getPatientPaginate(
        defaultQuery,
        defaultLimit,
        defaultPage,
        defaultSort,
        req.user
        );
        patientsGetted
            ? res.status(200).send({ status: "Success", patients: patientsGetted })
            : res.status(500).send({ status: "ERROR" });
    } catch (error) {
        console.log(error)
         res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
    
};

export const getPatientByQuery = async (req, res) =>{
    const { query } = req.query;
    const patientFounded = await patientsService.getPatientByQuery(query)
    patientFounded
        ? res.status(200).json({success: true, data: patientFounded})
        : res.status(500).json({success: false, error: "No se encontró pacientes que coincidan"})
}

export const createPatient = async (req, res) => {
    const patient = req.body;
    try {
        const patientCreated = await patientsService.createPatient(patient, req.user);
        if (!patientCreated.status) {
            if (patientCreated.error.code === 11000) {
                res.status(409).send({ status: "ERROR", code: 11000 });
            } else {
                res.status(500).send({ status: "ERROR" });
            }
        } else {
            res.status(201).send({ status: "Success", patients: patientCreated.dt });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "ERROR" });
    }
};

export const deletePatient = async (req, res) => {
    const patientID = req.params.id;
    const patientDeleted = await patientsService.deletePatient(patientID);
    patientDeleted
        ? res.status(200).send({ status: "Success", patients: patientDeleted })
        : res.status(404).send({ status: "ERROR" });
};

export const updatePatient = async (req, res) => {
    const patientData = req.body;
    const idPatient = req.params.id.trim();
    const patientUpdated = await patientsService.updatePatient(idPatient, patientData);
    patientUpdated
        ? res.status(201).send({ status: "Success", patients: patientUpdated })
        : res.status(404).send({ status: "ERROR" });
};
