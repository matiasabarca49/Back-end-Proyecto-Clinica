import PatientsManager from "../DAO/mongo/patients.mongo.js";
const patientsManager = new PatientsManager();

/**
 * Endpoint que retorna todos los pacientes de la DB
 * Respuesta: 
 *        200: retorna un Json con estado y array pacientes
 *        500: Error. Problema al obtener la colección de la DB
 */
export const getPatients = async (req, res) => {
    // Se obtiene la lista de pacientes de la base de datos
    const patientsGetted = await patientsManager.getPatients();
    patientsGetted
        ? res.status(200).send({ status: "Success", patients: patientsGetted })
        : res.status(500).send({ status: "ERROR", reason: "Los Pacientes no se pudieron obtener" });
};

/**
 * Endpoint que retorna un paciente de la DB mediante su ID
 * Param: ID de paciente
 * Respuesta: 
 *        200: retorna un Json con estado y objeto paciente
 *        404: Error. ID Incorrecto o no existe en la DB
 */
export const getPatientById = async (req, res) => {
    // Se obtiene el ID del paciente de los parámetros de la solicitud
    const patientID = req.params.id.trim();
    // Se busca el paciente por ID en la base de datos
    const patientGetted = await patientsManager.getPatientById(patientID);
    patientGetted
        ? res.status(200).send({ status: "Success", patients: patientGetted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna un paciente filtrado mediante un atributo
 * Query: { clave : valor }
 * Respuesta: 
 *        200: retorna un Json con estado y objeto paciente
 *        404: Error. El atributo no existe en el modelo o solicitud mal hecha
 */
export const getPatientByFilter = async (req, res) => {
    // Se extraen los parámetros de búsqueda de la query
    const filter = req.query;
    // Se busca el paciente filtrado según los parámetros
    const patientGetted = await patientsManager.getPatientByFilter(filter);
    patientGetted
        ? res.status(200).send({ status: "Success", patients: patientGetted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna la colección de pacientes utilizando paginate
 * Query: { search, query, sort, limit }
 * Respuesta: 
 *        200: retorna un Json con estado y pacientes
 *        500: Error. Problema al obtener la colección de la DB
 */
export const getsPatientsPaginate = async (req, res) => {
    // Se configuran los parámetros de consulta para paginación
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = { lastName: parseInt(sort) });
    search.length !== 0
        ? (defaultQuery = { lastName: search })
        : query !== "0" && (defaultQuery = { sex: query });
    // Se realiza la búsqueda con paginación
    const patientsGetted = await patientsManager.getPatientPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort);
    patientsGetted
        ? res.status(200).send({ status: "Success", patients: patientsGetted })
        : res.status(500).send({ status: "ERROR" });
};

/**
 * Endpoint que crea un documento de paciente en la colección
 * Body: Objeto paciente
 * Respuesta: 
 *        201: retorna un Json con estado y objeto paciente creado
 *        404: Error. El paciente no pudo ser creado
 */
export const createPatient = async (req, res) => {
    // Se recibe el objeto de paciente desde el cuerpo de la solicitud
    const patient = req.body;
    // Se crea el paciente en la base de datos
    const patientCreated = await patientsManager.createPatient(patient);
    if(!patientCreated.status)
        if(patientCreated.error.code === 11000){
            res.status(409).send({ status: "ERROR", code: 11000 });
        }else{
            res.status(500).send({ status: "ERROR" });
        }
    else{
        res.status(201).send({ status: "Success", patients: patientCreated.dt})
    }
};

/**
 * Endpoint que elimina un paciente de la colección con su ID
 * Params: ID paciente
 * Respuesta: 
 *        200: retorna un Json con estado y paciente eliminado
 *        404: Error. El ID no existe en la DB
 */
export const deletePatient = async (req, res) => {
    // Se obtiene el ID del paciente a eliminar
    const patientID = req.params.id;
    // Se elimina el paciente de la base de datos
    const patientDeleted = await patientsManager.deletePatient(patientID);
    patientDeleted
        ? res.status(200).send({ status: "Success", patients: patientDeleted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que actualiza un paciente en la DB con su ID
 * Params: ID paciente
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta: 
 *        201: retorna un Json con estado y paciente actualizado
 *        404: Error. El ID no existe en la DB
 */
export const updatePatient = async (req, res) => {
    // Se extraen los datos del cuerpo de la solicitud
    const patientData = req.body;
    // Se obtiene el ID del paciente de los parámetros de la solicitud
    const idPatient = req.params.id.trim();
    // Se actualiza el paciente en la base de datos
    const patientUpdated = await patientsManager.updatePatient(idPatient, patientData);
    patientUpdated
        ? res.status(201).send({ status: "Success", patients: patientUpdated })
        : res.status(404).send({ status: "ERROR" });
};
