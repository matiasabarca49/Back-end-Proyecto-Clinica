import DoctorsManager from "../DAO/mongo/doctors.mongo.js";
const doctorsManager = new DoctorsManager();

/**
 * Endpoint que retorna todos los doctores de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de doctores
 *        404: Error. Problema al obtener la colección de la DB
 */

export const getDoctors = async (req, res) => {
    const doctorsGetted = await doctorsManager.getDoctors();
    doctorsGetted
        ? res.status(200).send({ status: "Succes", doctors: doctorsGetted })
        : res.status(404).send({ status: "ERROR" });
};


/**
 * Endpoint que retorna un doctor de la colección mediante su ID
 * Param: ID del doctor
 * Respuesta:
 *        200: retorna un JSON con estado y objeto doctor
 *        404: Error. ID incorrecto o no existe en la DB
 */

export const getDoctorById = async (req, res) => {
    const doctorID = req.params.id.trim();
    const doctorGetted = await doctorsManager.getDoctorById(doctorID);
    doctorGetted
    ? res.status(200).send({ status: "Succes", doctors: doctorGetted }) : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna doctores filtrados por un atributo
 * Query: { clave: valor }
 * Respuesta:
 *        200: retorna un JSON con estado y array de doctores
 *        404: Error. El atributo no existe en el modelo o solicitud mal hecha
 */

export const getDoctorByFilter = async (req, res) => {
    const filter = req.query;
    const doctorGetted = await doctorsManager.getDoctorByFilter(filter);
    doctorGetted
    ? res.status(200).send({ status: "Succes", doctors: doctorGetted }) : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna la colección de doctores paginada
 * Query: { search, query: lastName, sort, limit, page }
 * Respuesta:
 *        200: retorna un JSON con estado y objeto de doctores paginados
 *        500: Error. El atributo no existe en el modelo o solicitud mal hecha
 */

export const getDoctorsPaginate = async (req, res) => {
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = {lastName: parseInt(sort)});
    search.length !== 0
        ? (defaultQuery = { lastName: search })
        : query !== "0" && (defaultQuery = {lastName: query });
    const doctorsGetted = await doctorsManager.getDoctorPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort);
    doctorsGetted
        ? res.status(200).send({ status: "Success", doctors: doctorsGetted })
        : res.status(500).send({ status: "ERROR" });
};

/**
 * Endpoint que crea un nuevo doctor en la colección de doctores
 * Body: Objeto Doctor
 * Respuesta:
 *        201: retorna un JSON con estado y objeto doctor creado
 *        404: Error. Datos inválidos o solicitud mal hecha
 */

export const createDoctor = async (req, res) => {
    const doctor = req.body;
    const doctorCreated = await doctorsManager.createDoctor(doctor);
    if(!doctorCreated.status)
        if(doctorCreated.error.code === 11000){
            res.status(409).send({ status: "ERROR", code: 11000 });
        }else{
            res.status(500).send({ status: "ERROR" });
        }
    else{
        res.status(201).send({ status: "Success", patients: doctorCreatedCreated.dt})
    }
};

/**
 * Endpoint que elimina un doctor de la colección mediante su ID
 * Params: ID del doctor
 * Respuesta:
 *        200: retorna un JSON con estado y objeto del doctor eliminado
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */

export const deleteDoctor = async (req, res) => {
    const doctorID = req.params.id;
    const doctorDeleted = await doctorsManager.deleteDoctor(doctorID);
    doctorDeleted
        ? res.status(200).send({ status: "Succes", doctors: doctorDeleted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que actualiza un doctor mediante su ID
 * Params: ID del doctor
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta:
 *        201: retorna un JSON con estado y objeto doctor actualizado
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */

export const updateDoctor = async (req, res) => {
    const doctorData = req.body;
    const idDoctor = req.params.id;
    const doctorUpdated = await doctorsManager.updateDoctor(idDoctor, doctorData);
    doctorUpdated
        ? res.status(201).send({ status: "Succes", doctors: doctorUpdated })
        : res.status(404).send({ status: "ERROR" });
};
