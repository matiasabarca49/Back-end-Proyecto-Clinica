import AppointmentsService from "../service/appointment.service.js";
import { CreateAppointmentDTO } from "../dto/appointment.dto.js";

const appointmentsService = new AppointmentsService();

/**
 * Endpoint que retorna todas las citas de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de citas
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getAppointments = async (req, res, next) => {
    try {
        
        const { person, query, status, limit, page, sort } = req.query;
        let appointmentsGetted;
        if(!limit && !page){
            appointmentsGetted = await appointmentsService.findAll();
        }else{
            appointmentsGetted = await appointmentsService.paginateAppointments(person, query, status, limit, page, sort);
        }
        
        return res.status(200).json({ success: true , data: appointmentsGetted })
            
    } catch (error) {
        console.log(error)
        next(error)
    }
};


/**
 * Endpoint que retorna las citas del día actual
 * Respuesta:
 *        200: retorna un JSON con estado y array de citas
 *        500: Error. Problema al obtener la colección de la DB
 */
export const getTodayAppointments = async (req, res, next) => {
    try{

        const appointmentsGetted = await appointmentsService.findToday();
        
        return res.status(200).json({ success: true , data: appointmentsGetted })

    }catch(error){
        next(error)
    }
}

/**
 * Endpoint que retorna una cita de la colección mediante su ID
 * Param: ID de la cita
 * Respuesta:
 *        200: retorna un JSON con estado y objeto cita
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getAppointmentById = async (req, res, next) => {
    try {
        const appointmentID = req.params.id;
        const appointmentGetted = await appointmentsService.findById(appointmentID);
        
        return res.status(200).json({ success: true, data: appointmentGetted })
            
    } catch (error) {
        console.log("enpoint ID")
        console.log(error)
        next(error)
    }
};


/**
 * Endpoint que crea una nueva cita en la colección de citas
 * Body: Objeto Appointment
 * Respuesta:
 *        201: retorna un JSON con estado y objeto cita creada
 *        404: Error. Datos inválidos o solicitud mal hecha
 */
export const createAppointment = async (req, res, next) => {
    try {
        // Crear DTO de Borde de creación de cita
        const appointment = new CreateAppointmentDTO(req.body);

        const appointmentCreated = await appointmentsService.create(appointment);
        
        return res.status(201).json({ success: true, data: appointmentCreated });
        
    } catch (error) {
        next(error)
    }
};

/**
 * Endpoint que elimina una cita de la colección mediante su ID
 * Params: ID de la cita
 * Respuesta:
 *        200: retorna un JSON con estado y objeto de la cita eliminada
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */
export const deleteAppointment = async (req, res, next) => {
    try {
        const appointmentID = req.params.id;
        const appointmentDeleted = await appointmentsService.delete(appointmentID);
        
        return res.status(200).json({ success: true, data: appointmentDeleted })
            
    } catch (error) {
        next(error)
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
export const updateAppointment = async (req, res, next) => {
    try {
        const appointmentData = req.body;
        const appointmentID = req.params.id;
        const appointmentUpdated = await appointmentsService.update(appointmentID, appointmentData);
        
        return res.status(201).json({ success: true, data: appointmentUpdated })
            
    } catch (error) {
        next(error)
    }
};

export const getAvailableAppointments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { day } = req.query;
        const availableAppointments = await appointmentsService.getAvailableAppointments(id, day);
        
        return res.status(200).json({ success: true, data: availableAppointments.data })
            
    } catch (error) {
        next(error)
    }
};

export const getNearestAppointments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const nearestAppointments = await appointmentsService.getNearestAppointments(id);
        
        return res.status(200).json({ success: true, data: nearestAppointments })
            
    } catch (error) {
        next(error)
    }
};
export const checkInAppointment = async (req, res, next) => {
    try {

        const appointmentID = req.params.id;

        const appointment = await appointmentsService.checkIn(appointmentID);

        return res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        next(error);
    }
};