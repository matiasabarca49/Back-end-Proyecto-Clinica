import TreatmentsService from "../service/mongo/treatment.service.js";
const treatmentsService = new TreatmentsService();

/**
 * Endpoint que retorna todos los tratamientos de la DB
 * Respuesta: 
 *        200: retorna un Json con estado y array tratamientos
 *        500: Error. Problema al obtener la colección de la DB
 */
export const getTreatments = async (req, res) => {
    try {
        // Se obtiene la lista de tratamientos de la base de datos
        const treatmentsGetted = await treatmentsService.getTreatments();
        treatmentsGetted
            ? res.status(200).send({ status: "Success", treatments: treatmentsGetted })
            : res.status(500).send({ status: "ERROR" });
    } catch (error) {
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Endpoint que retorna un tratamiento mediante su ID
 * Param: ID de tratamiento
 * Respuesta: 
 *        200: retorna un Json con estado y objeto tratamiento
 *        404: Error. ID Incorrecto o no existe en la DB
 */
export const getTreatmentByID = async (req, res) => {
    try {
        // Se obtiene el ID del tratamiento de los parámetros de la solicitud
        const treatmentID = req.params.id;
        // Se busca el tratamiento por ID en la base de datos
        const treatmentGetted = await treatmentsService.getTreatmentById(treatmentID);
        treatmentGetted
            ? res.status(200).send({ status: "Success", treatments: treatmentGetted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Endpoint que retorna un tratamiento filtrado mediante un atributo
 * Query: { clave : valor }
 * Respuesta: 
 *        200: retorna un Json con estado y objeto tratamiento
 *        404: Error. El atributo no existe en el modelo o solicitud mal hecha
 */
export const getTreatmentByFilter = async (req, res) => {
    try {
        // Se extraen los parámetros de filtro de la query
        const filter = req.query;
        // Se busca el tratamiento según el filtro proporcionado
        const treatmentGetted = await treatmentsService.getTreatmentByFilter(filter);
        treatmentGetted
            ? res.status(200).send({ status: "Success", treatments: treatmentGetted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Endpoint que retorna la colección de tratamientos utilizando paginate
 * Query: { search, query, sort, limit }
 * Respuesta: 
 *        200: retorna un Json con estado y tratamientos
 *        500: Error. Problema al obtener la colección de la DB
 */
export const getTreatmentsPaginate = async (req, res) => {
    try {
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
        const treatmentsGetted = await treatmentsService.getTreatmentPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort);
        treatmentsGetted
            ? res.status(200).send({ status: "Success", treatments: treatmentsGetted })
            : res.status(500).send({ status: "ERROR" });
    } catch (error) {
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Endpoint que crea un tratamiento en la colección
 * Body: Objeto tratamiento
 * Respuesta: 
 *        201: retorna un Json con estado y tratamiento creado
 *        404: Error. El tratamiento no pudo ser creado
 */
export const createTreatment = async (req, res) => {
    try {
        // Se recibe el objeto de tratamiento desde el cuerpo de la solicitud
        const treatment = req.body;
        // Se crea el tratamiento en la base de datos
        const treatmentCreated = await treatmentsService.createTreatment(treatment);
        if(!treatmentCreated.status)
            if(treatmentCreated.error.code === 11000){
                res.status(409).send({ status: "ERROR", code: 11000 });
            }else{
                res.status(500).send({ status: "ERROR" });
            }
        else{
            res.status(201).send({ status: "Success", patients: treatmentCreated.dt})
        }
    } catch (error) {
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Endpoint que elimina un tratamiento de la colección con su ID
 * Params: ID de tratamiento
 * Respuesta: 
 *        200: retorna un Json con estado y tratamiento eliminado
 *        404: Error. El ID no existe en la DB
 */
export const deleteTreatment = async (req, res) => {
    try {
        // Se obtiene el ID del tratamiento a eliminar
        const treatmentID = req.params.id;
        // Se elimina el tratamiento de la base de datos
        const treatmentDeleted = await treatmentsService.deleteTreatment(treatmentID);
        treatmentDeleted
            ? res.status(200).send({ status: "Success", treatments: treatmentDeleted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        res.status(500).send({ status: "ERROR", message: error.message });
    }
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
    try {
        // Se extraen los datos del cuerpo de la solicitud
        const treatmentData = req.body;
        // Se obtiene el ID del tratamiento de los parámetros de la solicitud
        const idTreatment = req.params.id;
        // Se actualiza el tratamiento en la base de datos
        const treatmentUpdated = await treatmentsService.updateTreatment(idTreatment, treatmentData);
        treatmentUpdated
            ? res.status(201).send({ status: "Success", treatments: treatmentUpdated })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};
