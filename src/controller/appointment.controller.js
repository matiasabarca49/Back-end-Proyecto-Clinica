import AppointmentsService from "../service/mongo/appointment.service.js";
const appointmentsService = new AppointmentsService();

/**
 * Endpoint que retorna todas las citas de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de citas
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getAppointments = async (req, res) => {
    try {
        const appointmentsGetted = await appointmentsService.getAppointments();
        appointmentsGetted
            ? res.status(200).send({ status: "Succes", appointments: appointmentsGetted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en getAppointments:", error);
        res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

/**
 * Endpoint que retorna una cita de la colección mediante su ID
 * Param: ID de la cita
 * Respuesta:
 *        200: retorna un JSON con estado y objeto cita
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getAppointmentById = async (req, res) => {
    try {
        const appointmentID = req.params.id;
        const appointmentGetted = await appointmentsService.getAppointmentById(appointmentID);
        appointmentGetted
            ? res.status(200).send({ status: "Succes", appointment: appointmentGetted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en getAppointmentById:", error);
        res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

/**
 * Endpoint que retorna citas filtradas por un atributo
 * Query: { clave: valor }
 * Respuesta:
 *        200: retorna un JSON con estado y array de citas
 *        404: Error. El atributo no existe en el modelo o solicitud mal hecha
 */
export const getAppointmentsByFilter = async (req, res) => {
    try {
        const filter = req.query;
        const appointmentsGetted = await appointmentsService.getAppointmentsByFilter(filter);
        appointmentsGetted
            ? res.status(200).send({ status: "Succes", appointments: appointmentsGetted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en getAppointmentsByFilter:", error);
        res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

/**
 * Endpoint que retorna la colección de citas paginadas
 * Query: { search, query: doctorId, sort, limit, page }
 * Respuesta:
 *        200: retorna un JSON con estado y objeto de citas paginadas
 *        500: Error. El atributo no existe en el modelo o solicitud mal hecha
 */
export const getAppointmentsPaginate = async (req, res) => {
    try {
        let defaultQuery, defaultLimit, defaultPage, defaultSort;
        const { search, query, sort, page, limit } = req.query;
        limit && (defaultLimit = parseInt(limit));
        page && (defaultPage = parseInt(page));
        sort && (defaultSort = { date: parseInt(sort) });
        search.length !== 0
            ? (defaultQuery = { date: search })
            : query !== "0" && (defaultQuery = { doctorId: query });

        const appointmentsGetted = await appointmentsService.getAppointmentsPaginate(
            defaultQuery,
            defaultLimit,
            defaultPage,
            defaultSort
        );

        appointmentsGetted
            ? res.status(200).send({ status: "Success", appointments: appointmentsGetted })
            : res.status(500).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en getAppointmentsPaginate:", error);
        res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

export const getAppointmentByQuery = async (req, res) => {
    try {
        const { person, query, status,limit, page, sort } = req.query;
        const appointmetsFounded = await appointmentsService.getAppointmentByQuery(person, query, status,limit, page, sort);
        appointmetsFounded
            ? res.status(200).json({ success: true, data: appointmetsFounded })
            : res.status(500).json({ success: false, error: "No se encontró turnos que coincidan" });
    } catch (error) {
        console.error("Error en getAppointmentByQuery:", error);
        res.status(500).json({ success: false, error: "Error en el Servidor. Intente mas tarde" });
    }
};

/**
 * Endpoint que crea una nueva cita en la colección de citas
 * Body: Objeto Appointment
 * Respuesta:
 *        201: retorna un JSON con estado y objeto cita creada
 *        404: Error. Datos inválidos o solicitud mal hecha
 */
export const createAppointment = async (req, res) => {
    try {
        const appointment = req.body;
        const appointmentCreated = await appointmentsService.createAppointment(appointment);
        if (!appointmentCreated.status)
            if (appointmentCreated.error.code === 11000) {
                res.status(409).send({ status: "ERROR", code: 11000 });
            } else {
                res.status(500).send({ status: "ERROR" });
            }
        else {
            res.status(201).send({ status: "Success", patients: appointmentCreated.dt });
        }
    } catch (error) {
        console.error("Error en createAppointment:", error);
        res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

/**
 * Endpoint que elimina una cita de la colección mediante su ID
 * Params: ID de la cita
 * Respuesta:
 *        200: retorna un JSON con estado y objeto de la cita eliminada
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */
export const deleteAppointment = async (req, res) => {
    try {
        const appointmentID = req.params.id;
        const appointmentDeleted = await appointmentsService.deleteAppointment(appointmentID);
        appointmentDeleted
            ? res.status(200).send({ status: "Succes", appointment: appointmentDeleted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en deleteAppointment:", error);
        res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
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
    try {
        const appointmentData = req.body;
        const appointmentID = req.params.id;
        const appointmentUpdated = await appointmentsService.updateAppointment(appointmentID, appointmentData);
        appointmentUpdated
            ? res.status(201).send({ status: "Succes", appointment: appointmentUpdated })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en updateAppointment:", error);
        res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};
