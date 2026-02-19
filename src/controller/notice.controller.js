import NoticesService from "../service/notice.service.js";
const noticesService = new NoticesService();

/**
 * Endpoint que retorna todos los avisos de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de avisos
 */
export const getNotices = async (req, res, next) => {
    try {
        const { limit, page, sort } = req.query;
        let noticesGetted;
        if (!limit && !page) {
            noticesGetted = await noticesService.findAll(req.user);
        } else {
            noticesGetted = await noticesService.paginateNotices({}, limit, page, sort, req.user);
        }
        return res.status(200).json({ success: true, data: noticesGetted });
    } catch (error) {
        console.error("Error en getNotices:", error);
        next(error);
    }
};

/**
 * Endpoint que retorna un aviso mediante su ID
 * Param: ID del aviso
 * Respuesta:
 *        200: retorna un JSON con estado y objeto aviso
 */
export const getNoticeById = async (req, res, next) => {
    try {
        const noticeID = req.params.id.trim();
        const noticeGetted = await noticesService.findById(noticeID);
        return res.status(200).json({ success: true, data: noticeGetted });
    } catch (error) {
        console.error("Error en getNoticeById:", error);
        next(error);
    }
};

/**
 * Endpoint que crea un nuevo aviso en la colección
 * Body: Objeto Notice
 * Respuesta:
 *        201: retorna un JSON con estado y aviso creado
 */
export const createNotice = async (req, res, next) => {
    try {
        const notice = req.body;
        const noticeCreated = await noticesService.create(notice, req.user);
        return res.status(201).json({ success: true, data: noticeCreated });
    } catch (error) {
        console.error("Error en createNotice:", error);
        next(error);
    }
};

/**
 * Endpoint que elimina un aviso de la colección mediante su ID
 * Params: ID del aviso
 * Respuesta:
 *        200: retorna un JSON con estado y aviso eliminado
 */
export const deleteNotice = async (req, res, next) => {
    try {
        const noticeID = req.params.id;
        const noticeDeleted = await noticesService.delete(noticeID, req.user);
        return res.status(200).json({ success: true, data: noticeDeleted });
    } catch (error) {
        console.error("Error en deleteNotice:", error);
        next(error);
    }
};

/**
 * Endpoint que actualiza un aviso mediante su ID
 * Params: ID del aviso
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta:
 *        200: retorna un JSON con estado y aviso actualizado
 */
export const updateNotice = async (req, res, next) => {
    try {
        const noticeData = req.body;
        const idNotice = req.params.id.trim();
        const noticeUpdated = await noticesService.update(idNotice, noticeData, req.user);
        return res.status(200).json({ success: true, data: noticeUpdated });
    } catch (error) {
        console.error("Error en updateNotice:", error);
        next(error);
    }
};