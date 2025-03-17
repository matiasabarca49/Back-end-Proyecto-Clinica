import AppointmentsManager from "../DAO/mongo/appointments.mongo.js";
const appointmentsManager = new AppointmentsManager();

export const getAppointments = async (req, res) => {
    const appointmentsGetted = await appointmentsManager.getAppointments();
    appointmentsGetted
        ? res.status(200).send({ status: "Succes", appointments: appointmentsGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getAppointmentById = async (req, res) => {
    const appointmentID = req.params.id;
    const appointmentGetted = await appointmentsManager.getAppointmentById(appointmentID);
    appointmentGetted
        ? res.status(200).send({ status: "Succes", appointment: appointmentGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getAppointmentsByFilter = async (req, res) => {
    const filter = req.query;
    const appointmentsGetted = await appointmentsManager.getAppointmentsByFilter(filter);
    appointmentsGetted
        ? res.status(200).send({ status: "Succes", appointments: appointmentsGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getAppointmentsPaginate = async (req, res) => {
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    console.log(req.query);
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

export const createAppointment = async (req, res) => {
    const appointment = req.body;
    const appointmentCreated = await appointmentsManager.createAppointment(appointment);
    appointmentCreated
        ? res.status(201).send({ status: "Succes", appointment: appointmentCreated })
        : res.status(404).send({ status: "ERROR" });
};

export const deleteAppointment = async (req, res) => {
    const appointmentID = req.params.id;
    const appointmentDeleted = await appointmentsManager.deleteAppointment(appointmentID);
    appointmentDeleted
        ? res.status(200).send({ status: "Succes", appointment: appointmentDeleted })
        : res.status(404).send({ status: "ERROR" });
};

export const updateAppointment = async (req, res) => {
    const appointmentData = req.body;
    const appointmentID = req.params.id;
    const appointmentUpdated = await appointmentsManager.updateAppointment(appointmentID, appointmentData);
    console.log(appointmentUpdated);
    appointmentUpdated
        ? res.status(201).send({ status: "Succes", appointment: appointmentUpdated })
        : res.status(404).send({ status: "ERROR" });
};
