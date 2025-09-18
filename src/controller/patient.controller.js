import { Query } from "mongoose";
import PatientsService from "../service/mongo/patient.service.js";
const patientsService = new PatientsService();

/**
 * Endpoint que retorna todos los pacientes de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de pacientes
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getPatients = async (req, res) => {
    try {
        const patientsGetted = await patientsService.getPatients(req.user);
        patientsGetted
            ? res.status(200).send({ status: "Success", patients: patientsGetted })
            : res.status(404).send({ status: "ERROR", reason: "Los Pacientes no se pudieron obtener" });
    } catch (error) {
        console.error("Error en getPatients:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Endpoint que retorna un paciente mediante su ID
 * Param: ID del paciente
 * Respuesta:
 *        200: retorna un JSON con estado y objeto paciente
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getPatientById = async (req, res) => {
    try {
        const patientID = req.params.id.trim();
        const patientGetted = await patientsService.getPatientById(patientID);
        patientGetted
            ? res.status(200).send({ status: "Success", patients: patientGetted })
            : res.status(404).send({ status: "ERROR", reason: "Paciente no encontrado" });
    } catch (error) {
        console.error("Error en getPatientById:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};

/**
 * Endpoint que retorna pacientes filtrados por un atributo
 * Query: { clave: valor }
 * Respuesta:
 *        200: retorna un JSON con estado y array de pacientes
 *        404: Error. El atributo no existe en el modelo o solicitud mal hecha
 */
export const getPatientByFilter = async (req, res) => {
    try {
        const filter = req.query;
        const patientGetted = await patientsService.getPatientByFilter(filter);
        patientGetted
            ? res.status(200).send({ status: "Success", patients: patientGetted })
            : res.status(404).send({ status: "ERROR", reason: "No se encontraron pacientes con ese filtro" });
    } catch (error) {
        console.error("Error en getPatientByFilter:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};

/**
 * Endpoint que retorna pacientes paginados
 * Query: { search, query: sexo, sort, limit, page }
 * Respuesta:
 *        200: retorna un JSON con estado y objeto de pacientes paginados
 *        404: Error. No se encontraron pacientes
 *        500: Error. Problema en el servidor o en la query
 */
export const getsPatientsPaginate = async (req, res) => {
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = { lastName: parseInt(sort) });
    search?.length !== 0
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
            : res.status(404).send({ status: "ERROR", reason: "No se encontraron pacientes" });
    } catch (error) {
        console.error("Error en getsPatientsPaginate:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Endpoint que retorna pacientes filtrados por texto (búsqueda avanzada)
 * Query: { query: texto }
 * Respuesta:
 *        200: retorna un JSON con estado y array de pacientes encontrados
 *        404: Error. No se encontraron pacientes
 *        500: Error en el servidor
 */
export const getPatientByQuery = async (req, res) => {
    try {
        const { query } = req.query;
        const patientFounded = await patientsService.getPatientByQuery(query);
        patientFounded
            ? res.status(200).json({ success: true, data: patientFounded })
            : res.status(404).json({ success: false, error: "No se encontraron pacientes que coincidan" });
    } catch (error) {
        console.error("Error en getPatientByQuery:", error);
        res.status(500).json({ success: false, error: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Endpoint que crea un nuevo paciente en la colección
 * Body: Objeto Patient
 * Respuesta:
 *        201: retorna un JSON con estado y paciente creado
 *        409: Error. Paciente duplicado (code 11000)
 *        500: Error en el servidor
 */
export const createPatient = async (req, res) => {
    try {
        const patient = req.body;
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
        console.error("Error en createPatient:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Endpoint que elimina un paciente de la colección mediante su ID
 * Params: ID del paciente
 * Respuesta:
 *        200: retorna un JSON con estado y paciente eliminado
 *        404: Error. El ID no existe en la DB
 *        500: Error en el servidor
 */
export const deletePatient = async (req, res) => {
    try {
        const patientID = req.params.id;
        const patientDeleted = await patientsService.deletePatient(patientID);
        patientDeleted
            ? res.status(200).send({ status: "Success", patients: patientDeleted })
            : res.status(404).send({ status: "ERROR", reason: "Paciente no encontrado" });
    } catch (error) {
        console.error("Error en deletePatient:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};

/**
 * Endpoint que actualiza un paciente mediante su ID
 * Params: ID del paciente
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta:
 *        201: retorna un JSON con estado y paciente actualizado
 *        404: Error. El ID no existe en la DB
 *        500: Error en el servidor
 */
export const updatePatient = async (req, res) => {
    try {
        const patientData = req.body;
        const idPatient = req.params.id.trim();
        const patientUpdated = await patientsService.updatePatient(idPatient, patientData);
        patientUpdated
            ? res.status(201).send({ status: "Success", patients: patientUpdated })
            : res.status(404).send({ status: "ERROR", reason: "Paciente no encontrado" });
    } catch (error) {
        console.error("Error en updatePatient:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};
