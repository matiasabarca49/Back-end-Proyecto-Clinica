import AppointmentsManager from "../DAO/mongo/appointments.mongo.js";
const appointmentsManager = new AppointmentsManager();

export const getAppointments = async (req, res) => {
    const appointmentsGetted = await appointmentsManager.getAppointments();
    appointmentsGetted
        ? res.status(200).send({ status: "Success", appointments: appointmentsGetted })
        : res.status(500).send({ status: "ERROR", reason: "Los turnos no se pudieron obtener" });
};

export const getAppointmentById = async (req, res) => {
    const appointmentID = req.params.id;
    const appointmentGetted = await appointmentsManager.getAppointmentById(appointmentID);
    appointmentGetted
        ? res.status(200).send({ status: "Success", appointment: appointmentGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getAppointmentsByFilter = async (req, res) => {
    const filter = req.query;
    const appointmentsGetted = await appointmentsManager.getAppointmentsByFilter(filter);
    appointmentsGetted
        ? res.status(200).send({ status: "Success", appointments: appointmentsGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const createAppointment = async (req, res) => {
    const appointment = req.body;
    const appointmentCreated = await appointmentsManager.createAppointment(appointment);
    appointmentCreated
        ? res.status(201).send({ status: "Success", appointment: appointmentCreated })
        : res.status(404).send({ status: "ERROR" });
};

export const deleteAppointment = async (req, res) => {
    const appointmentID = req.params.id.trim();
    const appointmentDeleted = await appointmentsManager.deleteAppointment(appointmentID);
    appointmentDeleted
        ? res.status(200).send({ status: "Success", appointment: appointmentDeleted })
        : res.status(400).send({ status: "ERROR" });
};

export const updateAppointment = async (req, res) => {
    const appointmentData = req.body;
    const appointmentID = req.params.id;
    console.log(appointmentData);

    const appointmentUpdated = await appointmentsManager.updateAppointment(appointmentID, appointmentData);
    appointmentUpdated
        ? res.status(201).send({ status: "Success", appointment: appointmentUpdated })
        : res.status(400).send({ status: "ERROR" });
};
