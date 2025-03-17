import treatmentsManager from "../DAO/mongo/treatments.mongo.js";
const treatmentManager = new treatmentsManager();

/**
 * Endpoint que retorna todos los tratamientos de la DB
 * Respuesta: 
 *        200: retorna un Json con estado y array tratamientos
 *        500: Error. Problema al obtener la colección de la DB
 */
export const getTreatments = async (req, res) => {
    // Se obtiene la lista de tratamientos de la base de datos
    const treatmentsGetted = await treatmentManager.getTreatments();
    treatmentsGetted
        ? res.status(200).send({ status: "Success", treatments: treatmentsGetted })
        : res.status(500).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna un tratamiento mediante su ID
 * Param: ID de tratamiento
 * Respuesta: 
 *        200: retorna un Json con estado y objeto tratamiento
 *        404: Error. ID Incorrecto o no existe en la DB
 */
export const getTreatmentByID = async (req, res) => {
    // Se obtiene el ID del tratamiento de los parámetros de la solicitud
    const treatmentID = req.params.id;
    // Se busca el tratamiento por ID en la base de datos
    const treatmentGetted = await treatmentManager.getTreatmentById(treatmentID);
    treatmentGetted
        ? res.status(200).send({ status: "Success", treatments: treatmentGetted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna un tratamiento filtrado mediante un atributo
 * Query: { clave : valor }
 * Respuesta: 
 *        200: retorna un Json con estado y objeto tratamiento
 *        404: Error. El atributo no existe en el modelo o solicitud mal hecha
 */
export const getTreatmentByFilter = async (req, res) => {
    // Se extraen los parámetros de filtro de la query
    const filter = req.query;
    // Se busca el tratamiento según el filtro proporcionado
    const treatmentGetted = await treatmentManager.getTreatmentByFilter(filter);
    treatmentGetted
        ? res.status(200).send({ status: "Success", treatments: treatmentGetted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna la colección de tratamientos utilizando paginate
 * Query: { search, query, sort, limit }
 * Respuesta: 
 *        200: retorna un Json con estado y tratamientos
 *        500: Error. Problema al obtener la colección de la DB
 */
export const getTreatmentsPaginate = async (req, res) => {
    // Se configuran los parámetros de consulta para paginación
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = { lastName: parseInt(sort) });
    search.length !== 0
        ? (defaultQuery = { lastName: search })
        : query !== "0" && (defaultQuery = { role: query });
    // Se realiza la búsqueda con paginación
    const treatmentsGetted = await treatmentManager.getTreatmentPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort);
    treatmentsGetted
        ? res.status(200).send({ status: "Success", treatments: treatmentsGetted })
        : res.status(500).send({ status: "ERROR" });
};

/**
 * Endpoint que crea un tratamiento en la colección
 * Body: Objeto tratamiento
 * Respuesta: 
 *        201: retorna un Json con estado y tratamiento creado
 *        404: Error. El tratamiento no pudo ser creado
 */
export const createTreatment = async (req, res) => {
    // Se recibe el objeto de tratamiento desde el cuerpo de la solicitud
    const treatment = req.body;
    // Se crea el tratamiento en la base de datos
    const treatmentCreated = await treatmentManager.createTreatment(treatment);
    treatmentCreated
        ? res.status(201).send({ status: "Success", treatments: treatmentCreated })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que elimina un tratamiento de la colección con su ID
 * Params: ID de tratamiento
 * Respuesta: 
 *        200: retorna un Json con estado y tratamiento eliminado
 *        404: Error. El ID no existe en la DB
 */
export const deleteTreatment = async (req, res) => {
    // Se obtiene el ID del tratamiento a eliminar
    const treatmentID = req.params.id;
    // Se elimina el tratamiento de la base de datos
    const treatmentDeleted = await treatmentManager.deleteTreatment(treatmentID);
    treatmentDeleted
        ? res.status(200).send({ status: "Success", treatments: treatmentDeleted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que actualiza un tratamiento en la DB con su ID
 * Params: ID tratamiento
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta: 
 *        201: retorna un Json con estado y tratamiento actualizado
 *        404: Error. El ID no existe en la DB
 */
export const updateTreatment = async (req, res) => {
    // Se extraen los datos del cuerpo de la solicitud
    const treatmentData = req.body;
    // Se obtiene el ID del tratamiento de los parámetros de la solicitud
    const idTreatment = req.params.id;
    // Se actualiza el tratamiento en la base de datos
    const treatmentUpdated = await treatmentManager.updateTreatment(idTreatment, treatmentData);
    treatmentUpdated
        ? res.status(201).send({ status: "Success", treatments: treatmentUpdated })
        : res.status(404).send({ status: "ERROR" });
};
