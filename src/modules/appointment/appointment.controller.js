import AppointmentsService from "./appointment.service.js";
import { CreateAppointmentDTO } from "./appointment.dto.js";

const appointmentsService = new AppointmentsService();

/**
 * Endpoint que retorna todas las citas de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de citas
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getAppointments = async (req, res, next) => {
    try {
        let filters = {}

        if(req.user?.rol === "doctor"){
            filters.doctorID = req.user.id
        }

        let appointmentsGetted;
        if(!Object.keys(req.query).length){
            appointmentsGetted = await appointmentsService.findAll(filters);
        }else{
            const {doctor, patient,  from, to, room, typeAppointment, status, limit, page, sort} = req.query;

            if(doctor && req.user?.rol !== "doctor") filters.doctor= doctor
            if(patient) filters.patient= patient
            if(from) filters.from= from
            if(to) filters.to= to
            if(room) filters.room= room
            if(typeAppointment) filters.typeAppointment= typeAppointment
            if(status) filters.status= status

            appointmentsGetted = await appointmentsService.paginateAppointments(filters, limit, page, sort);
        }
        
        return res.status(200).json({ success: true , data: appointmentsGetted })
            
    } catch (error) {
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

        //En caso de que el usuario sea doctor, se filtran las citas por su ID
        let filters = {}

        if(req.user?.rol === "doctor"){
            filters.doctorID = req.user.id
        }

        const appointmentsGetted = await appointmentsService.findToday(filters);
        
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
        const appointmentGetted = await appointmentsService.findById(appointmentID, req.user);
        
        return res.status(200).json({ success: true, data: appointmentGetted })
            
    } catch (error) {
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

        const appointmentCreated = await appointmentsService.create(appointment, req.user);
        
        return res.status(201).json({ success: true, data: appointmentCreated });
        
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
        const appointmentUpdated = await appointmentsService.update(appointmentID, appointmentData, req.user);
        
        return res.status(201).json({ success: true, data: appointmentUpdated })
            
    } catch (error) {
        next(error)
    }
};

/**
 * Endpoint que retorna la grilla de un doctor en un día: slots libres y ocupados
 * Respuesta:
 *        200: retorna un JSON con estado y { date, duration, slots, occupiedSlots } (minutos del día)
 *        400: Error. ID o fecha inválidos
 *        403: Error. Un doctor pidió la grilla de otro doctor
 *        404: Error. El doctor no existe
 */
export const getAvailableAppointments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { day } = req.query;
        const availableAppointments = await appointmentsService.getAvailableAppointments(id, day, req.user);

        return res.status(200).json({ success: true, data: availableAppointments })

    } catch (error) {
        next(error)
    }
};

/**
 * Endpoint que retorna la disponibilidad diaria de un doctor en un rango, para el calendario
 * Query: doctor, from, to (YYYY-MM-DD)
 * Respuesta:
 *        200: retorna un JSON con estado y { doctorID, frequency, from, to, days }
 *        400: Error. ID, fechas o rango inválidos
 *        403: Error. Un doctor pidió la disponibilidad de otro doctor
 *        404: Error. El doctor no existe
 */
export const getAvailability = async (req, res, next) => {
    try {
        const { doctor, from, to } = req.query;
        const availability = await appointmentsService.getAvailability(doctor, from, to, req.user);

        return res.status(200).json({ success: true, data: availability })

    } catch (error) {
        next(error)
    }
};

/**
 * Endpoint que retorna el día más cercano con slots libres de un doctor, a partir de mañana
 * Respuesta:
 *        200: retorna un JSON con estado y { date, duration, slots, slotsText }
 *        400: Error. ID inválido
 *        403: Error. Un doctor pidió los turnos libres de otro doctor
 *        404: Error. El doctor no existe o no tiene slots libres en los próximos 60 días
 */
export const getNearestAppointments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const nearestAppointments = await appointmentsService.getNearestAppointments(id, req.user);
        
        return res.status(200).json({ success: true, data: nearestAppointments })
            
    } catch (error) {
        next(error)
    }
};

export const checkInAppointment = async (req, res, next) => {
    try {

        const appointmentID = req.params.id;

        const room = req.body.room

        const appointment = await appointmentsService.checkIn(appointmentID, room, req.user);

        return res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        next(error);
    }
};
export const callAppointment = async (req, res, next) => {
    try {

        const appointmentID = req.params.id;

        const appointment = await appointmentsService.call(appointmentID, req.user);

        return res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint que finaliza un turno y guarda su odontograma en el del paciente
 * Respuesta:
 *        200: retorna un JSON con estado y el turno finalizado
 *        400: Error. El turno no está en estado called
 *        404: Error. El turno o el paciente no existen
 *        409: Error. El turno cambió mientras se finalizaba; se puede reintentar
 */
export const finalizeAppointment = async (req, res, next) => {
    try {

        const appointmentID = req.params.id;

        const appointment = await appointmentsService.finalize(appointmentID, req.user);

        return res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        next(error);
    }
};

export const changeStatusAppointment = async (req, res, next) => {
    try {

        const appointmentID = req.params.id;

        const status = req.body.status

        const appointment = await appointmentsService.changeStatus(appointmentID, status);

        return res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint que retorna el odontograma de un turno
 * Respuesta:
 *        200: retorna un JSON con estado y el odontograma del turno
 *        404: Error. El turno no existe
 */
export const getAppointmentOdontogram = async (req, res, next) => {
    try {

        const appointmentID = req.params.id;

        const odontogram = await appointmentsService.getOdontogram(appointmentID, req.user);

        return res.status(200).json({
            success: true,
            data: odontogram
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint que agrega, reemplaza o quita un diente del odontograma del turno
 * Respuesta:
 *        200: retorna un JSON con estado y el odontograma del turno
 *        403: Error. El doctor no es el asignado al turno
 *        404: Error. El turno no existe
 *        409: Error. El turno no está en consulta o cambió durante la operación
 */
export const upsertAppointmentTooth = async (req, res, next) => {
    try {

        const appointmentID = req.params.id;

        // req.user: el service comprueba que un doctor solo modifique sus propios turnos.
        // El body ya fue validado como diente completo; Mongoose descarta campos fuera del esquema.
        const odontogram = await appointmentsService.upsertTooth(appointmentID, req.body, req.user);

        return res.status(200).json({
            success: true,
            data: odontogram
        });

    } catch (error) {
        next(error);
    }
};
