import AppointmentsManager from "../DAO/mongo/appointments.mongo.js";
const appointmentsManager = new AppointmentsManager();

/**
 * Endpoint que retorna todas las citas de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de citas
 *        404: Error. Problema al obtener la colección de la DB
 */

export const getAppointments = async (req, res) => {
    const appointmentsGetted = await appointmentsManager.getAppointments();
    appointmentsGetted
        ? res.status(200).send({ status: "Succes", appointments: appointmentsGetted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna una cita de la colección mediante su ID
 * Param: ID de la cita
 * Respuesta:
 *        200: retorna un JSON con estado y objeto cita
 *        404: Error. ID incorrecto o no existe en la DB
 */

export const getAppointmentById = async (req, res) => {
    const appointmentID = req.params.id;
    const appointmentGetted = await appointmentsManager.getAppointmentById(appointmentID);
    appointmentGetted
        ? res.status(200).send({ status: "Succes", appointment: appointmentGetted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna citas filtradas por un atributo
 * Query: { clave: valor }
 * Respuesta:
 *        200: retorna un JSON con estado y array de citas
 *        404: Error. El atributo no existe en el modelo o solicitud mal hecha
 */

export const getAppointmentsByFilter = async (req, res) => {
    const filter = req.query;
    const appointmentsGetted = await appointmentsManager.getAppointmentsByFilter(filter);
    appointmentsGetted
        ? res.status(200).send({ status: "Succes", appointments: appointmentsGetted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que retorna la colección de citas paginadas
 * Query: { search, query: doctorId, sort, limit, page }
 * Respuesta:
 *        200: retorna un JSON con estado y objeto de citas paginadas
 *        500: Error. El atributo no existe en el modelo o solicitud mal hecha
 */

export const getAppointmentsPaginate = async (req, res) => {
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = { date: parseInt(sort) });
    search.length !== 0
        ? (defaultQuery = { date: search })
        : query !== "0" && (defaultQuery = { doctorId: query });
    const appointmentsGetted = await appointmentsManager.getAppointmentsPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort);
    appointmentsGetted
        ? res.status(200).send({ status: "Success", appointments: appointmentsGetted })
        : res.status(500).send({ status: "ERROR" });
};

/**
 * Endpoint que crea una nueva cita en la colección de citas
 * Body: Objeto Appointment
 * Respuesta:
 *        201: retorna un JSON con estado y objeto cita creada
 *        404: Error. Datos inválidos o solicitud mal hecha
 */

export const createAppointment = async (req, res) => {
    const appointment = req.body;
    const appointmentCreated = await appointmentsManager.createAppointment(appointment);
    appointmentCreated
        ? res.status(201).send({ status: "Succes", appointment: appointmentCreated })
        : res.status(404).send({ status: "ERROR" });
};


/**
 * Endpoint que elimina una cita de la colección mediante su ID
 * Params: ID de la cita
 * Respuesta:
 *        200: retorna un JSON con estado y objeto de la cita eliminada
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */

export const deleteAppointment = async (req, res) => {
    const appointmentID = req.params.id;
    const appointmentDeleted = await appointmentsManager.deleteAppointment(appointmentID);
    appointmentDeleted
        ? res.status(200).send({ status: "Succes", appointment: appointmentDeleted })
        : res.status(404).send({ status: "ERROR" });
};

/**
 * Endpoint que actualiza una cita mediante su ID
 * Params: ID de la cita
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta:
 *        201: retorna un JSON con estado y objeto cita actualizada
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */

export const updateAppointment = async (req, res) => {
    const appointmentData = req.body;
    const appointmentID = req.params.id;
    const appointmentUpdated = await appointmentsManager.updateAppointment(appointmentID, appointmentData);
    appointmentUpdated
        ? res.status(201).send({ status: "Succes", appointment: appointmentUpdated })
        : res.status(404).send({ status: "ERROR" });
};
