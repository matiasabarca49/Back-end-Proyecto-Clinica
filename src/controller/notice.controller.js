import NoticesService from "../service/notice.service.js";
const noticesService = new NoticesService();

/**
 * Endpoint que retorna todos los avisos de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de avisos
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getNotices = async (req, res) => {
    try {
        const {limit, page, sort} = req.query;
        let noticesGetted;
        if(!limit && !page){
            noticesGetted = await noticesService.findAll(req.user);
        }else{
            noticesGetted = await noticesService.paginateNotices({}, limit, page, sort)
        }
        noticesGetted
            ? res.status(200).send({ status: "Success", notices: noticesGetted })
            : res.status(404).send({ status: "ERROR", reason: "Los Avisos no se pudieron obtener" });
    } catch (error) {
        console.error("Error en getNotices:", error);
        return res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Endpoint que retorna un aviso mediante su ID
 * Param: ID del aviso
 * Respuesta:
 *        200: retorna un JSON con estado y objeto aviso
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getNoticeById = async (req, res) => {
    try {
        const noticeID = req.params.id.trim();
        const noticeGetted = await noticesService.findById(noticeID);
        noticeGetted
            ? res.status(200).send({ status: "Success", notices: noticeGetted })
            : res.status(404).send({ status: "ERROR", reason: "Aviso no encontrado" });
    } catch (error) {
        console.error("Error en getNoticeById:", error);
        return res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};

/**
 * Endpoint que crea un nuevo aviso en la colección
 * Body: Objeto Notice
 * Respuesta:
 *        201: retorna un JSON con estado y aviso creado
 *        409: Error. Aviso duplicado (code 11000)
 *        500: Error en el servidor
 */
export const createNotice = async (req, res) => {
    try {
        const notice = req.body;
        const noticeCreated = await noticesService.create(notice, req.user);
        if (!noticeCreated.status) {
            if (noticeCreated.error.code === 11000) {
                res.status(409).send({ status: "ERROR", code: 11000 });
            } else {
                res.status(500).send({ status: "ERROR" });
            }
        } else {
            res.status(201).send({ status: "Success", notices: noticeCreated.dt });
        }
    } catch (error) {
        console.error("Error en createNotice:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Endpoint que elimina un aviso de la colección mediante su ID
 * Params: ID del aviso
 * Respuesta:
 *        200: retorna un JSON con estado y aviso eliminado
 *        404: Error. El ID no existe en la DB
 *        500: Error en el servidor
 */
export const deleteNotice = async (req, res) => {
    try {
        const noticeID = req.params.id;
        const noticeDeleted = await noticesService.delete(noticeID, req.user);

        // Si el servicio devuelve un objeto con status false, lo tratamos como error
        if (!noticeDeleted || noticeDeleted.status === false) {
            return res.status(403).send({ 
                status: "ERROR", 
                reason: noticeDeleted?.error || "No autorizado o aviso no encontrado" 
            });
        }

        // Si llegó acá, se borró correctamente
        res.status(200).send({ status: "Success", notices: noticeDeleted });
    } catch (error) {
        console.error("Error en deleteNotice:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};
/**
 * Endpoint que actualiza un aviso mediante su ID
 * Params: ID del aviso
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta:
 *        201: retorna un JSON con estado y aviso actualizado
 *        404: Error. El ID no existe en la DB
 *        500: Error en el servidor
 */
export const updateNotice = async (req, res) => {
    try {
        const noticeData = req.body;
        const idNotice = req.params.id.trim();
        const noticeUpdated = await noticesService.update(idNotice, noticeData);
        noticeUpdated
            ? res.status(201).send({ status: "Success", notices: noticeUpdated })
            : res.status(404).send({ status: "ERROR", reason: "Aviso no encontrado" });
    } catch (error) {
        console.error("Error en updateNotice:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};