import { get } from "mongoose";
import AppointmentsService from "../service/mongo/appointment.service.js";
import { sendAppointmentConfirmation } from "../utils/email.helpers.js";
import { slotsToRanges } from "../utils/slots.helper.js";

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
        const { person, query, status, limit, page, sort } = req.query;
        const appointmetsFounded = await appointmentsService.getAppointmentByQuery(person, query, status, limit, page, sort);
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
        
        if (!appointmentCreated.status) {
            if (appointmentCreated.error.code === 11000) {
                res.status(409).send({ status: "ERROR", code: 11000 });
            } else if (appointmentCreated.error.code === "a1b2c3d4e5f6"){
                res.status(400).send({ status: "ERROR", message: appointmentCreated.error.message });
            }
            else {
                res.status(500).send({ status: "ERROR" });
            }
        } else {
            // 🆕 Enviar email de confirmación al paciente
            try {
                const appointmentData = appointmentCreated.dt;
                const patient = appointmentData.patientID;
                
                // Verificar que tengamos los datos necesarios y que el populate haya funcionado
                if (!patient) {
                    console.warn("⚠️ No se pudo enviar email: patientID es null");
                } else if (typeof patient === 'string' || patient.constructor?.name === 'ObjectId') {
                    console.warn("⚠️ No se pudo enviar email: patientID no está populado");
                } else if (!patient.email) {
                    console.warn("⚠️ No se pudo enviar email: el paciente no tiene email");
                } else if (!appointmentData.slots || appointmentData.slots.length === 0) {
                    console.warn("⚠️ No se pudo enviar email: no hay slots");
                } else {
                    // ✅ Todo OK, enviar email
                    const patientFullName = `${patient.name} ${patient.lastName}`;
                    
                    // Usar el helper de slots existente para formatear el horario
                    const timeRanges = slotsToRanges(appointmentData.slots, "09:00", 30);
                    const appointmentTime = timeRanges.join(", ") || "Horario no especificado";
                    
                    const emailSent = await sendAppointmentConfirmation(
                        patient.email,
                        patientFullName,
                        appointmentData.date,
                        appointmentTime
                    );
                    
                    if (emailSent) {
                        console.log(`✉️ Email de confirmación enviado a ${patient.email}`);
                    } else {
                        console.warn(`⚠️ Error al enviar email a ${patient.email} (problema con el transporter)`);
                    }
                }
            } catch (emailError) {
                // No romper el flujo si falla el email
                console.error("⚠️ Error al enviar email de confirmación:", emailError.message || emailError);
            }
            
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
            ? res.status(200).send({ status: "Success", appointment: appointmentDeleted })
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
            ? res.status(201).send({ status: "Success", appointment: appointmentUpdated })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en updateAppointment:", error);
        res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

export const getAvailableAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const { day } = req.query;
        const availableAppointments = await appointmentsService.getAvailableAppointments(id, day);
        availableAppointments
            ? res.status(200).json({ success: "Success", data: availableAppointments.data })
            : res.status(404).json({ success: "ERROR", error: "No se encontraron turnos disponibles" });
    } catch (error) {
        console.error("Error en getAvailableAppointments:", error);
        res.status(500).json({ success: "ERROR", error: "Error en el Servidor. Intente mas tarde" });
    }
};

export const getNearestAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const nearestAppointments = await appointmentsService.getNearestAppointments(id);
        nearestAppointments
            ? res.status(200).json({ success: "Success", data: nearestAppointments })
            : res.status(404).json({ success: "ERROR", error: "No se encontraron turnos disponibles" });
    } catch (error) {
        console.error("Error en getNearestAppointments:", error);
        res.status(500).json({ success: "ERROR", error: "Error en el Servidor. Intente mas tarde" });
    }
};