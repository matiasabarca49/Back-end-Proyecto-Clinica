import NoticesService from "../service/mongo/notice.service.js";
const noticesService = new NoticesService();

/**
 * Endpoint que retorna todos los avisos de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de avisos
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getNotices = async (req, res) => {
    try {
        const noticesGetted = await noticesService.getNotices(req.user);
        noticesGetted
            ? res.status(200).send({ status: "Success", notices: noticesGetted })
            : res.status(404).send({ status: "ERROR", reason: "Los Avisos no se pudieron obtener" });
    } catch (error) {
        console.error("Error en getNotices:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
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
        const noticeGetted = await noticesService.getNoticeById(noticeID);
        noticeGetted
            ? res.status(200).send({ status: "Success", notices: noticeGetted })
            : res.status(404).send({ status: "ERROR", reason: "Aviso no encontrado" });
    } catch (error) {
        console.error("Error en getNoticeById:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};

/**
 * Endpoint que retorna avisos filtrados por un atributo
 * Query: { clave: valor }
 * Respuesta:
 *        200: retorna un JSON con estado y array de avisos
 *        404: Error. El atributo no existe en el modelo o solicitud mal hecha
 */
export const getNoticeByFilter = async (req, res) => {
    try {
        const filter = req.query;
        const noticeGetted = await noticesService.getNoticeByFilter(filter);
        noticeGetted
            ? res.status(200).send({ status: "Success", notices: noticeGetted })
            : res.status(404).send({ status: "ERROR", reason: "No se encontraron avisos con ese filtro" });
    } catch (error) {
        console.error("Error en getNoticeByFilter:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};

/**
 * Endpoint que retorna avisos paginados
 * Query: { search, query: prioridad, sort, limit, page }
 * Respuesta:
 *        200: retorna un JSON con estado y objeto de avisos paginados
 *        404: Error. No se encontraron avisos
 *        500: Error. Problema en el servidor o en la query
 */
export const getNoticesPaginate = async (req, res) => {
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = { date: parseInt(sort) });
    search?.length !== 0
        ? (defaultQuery = { title: new RegExp(search, 'i') })
        : query !== "0" && (defaultQuery = { priority: query });

    try {
        const noticesGetted = await noticesService.getNoticePaginate(
            defaultQuery,
            defaultLimit,
            defaultPage,
            defaultSort,
            req.user
        );
        noticesGetted
            ? res.status(200).send({ status: "Success", notices: noticesGetted })
            : res.status(404).send({ status: "ERROR", reason: "No se encontraron avisos" });
    } catch (error) {
        console.error("Error en getNoticesPaginate:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Endpoint que retorna avisos filtrados por texto (búsqueda avanzada)
 * Query: { query: texto }
 * Respuesta:
 *        200: retorna un JSON con estado y array de avisos encontrados
 *        404: Error. No se encontraron avisos
 *        500: Error en el servidor
 */
export const getNoticeByQuery = async (req, res) => {
    try {
        const { query } = req.query;
        const noticeFounded = await noticesService.getNoticeByQuery(query);
        noticeFounded
            ? res.status(200).json({ success: true, data: noticeFounded })
            : res.status(404).json({ success: false, error: "No se encontraron avisos que coincidan" });
    } catch (error) {
        console.error("Error en getNoticeByQuery:", error);
        res.status(500).json({ success: false, error: "Error en el servidor, intente más tarde" });
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
        const noticeCreated = await noticesService.createNotice(notice, req.user);
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
        const noticeDeleted = await noticesService.deleteNotice(noticeID);
        noticeDeleted
            ? res.status(200).send({ status: "Success", notices: noticeDeleted })
            : res.status(404).send({ status: "ERROR", reason: "Aviso no encontrado" });
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
        const noticeUpdated = await noticesService.updateNotice(idNotice, noticeData);
        noticeUpdated
            ? res.status(201).send({ status: "Success", notices: noticeUpdated })
            : res.status(404).send({ status: "ERROR", reason: "Aviso no encontrado" });
    } catch (error) {
        console.error("Error en updateNotice:", error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};