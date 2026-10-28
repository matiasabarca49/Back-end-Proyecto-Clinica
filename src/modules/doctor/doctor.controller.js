import DoctorsService from "./doctor.service.js";
import { UpdateDoctorRequestDTO } from "./doctor.dto.js";

const doctorsService = new DoctorsService();

/**
 * Endpoint que retorna todos los doctores de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de doctores
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getDoctors = async (req, res, next) => {
    try {
        const {search, sort, page, limit } = req.query;
        let doctorsGetted;
        if(!page && !limit){
            doctorsGetted = await doctorsService.findAll();
        }else{
            doctorsGetted = await doctorsService.paginateDoctors(search, limit, page, sort);
        }
        return res.status(200).json({ success: true, data: doctorsGetted })
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint que retorna los horarios de los doctores de la DB
 * Un doctor solo recibe el suyo (lo resuelve el service con req.user)
 * Respuesta:
 *        200: retorna un JSON con estado y array de doctores
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getSchedules = async (req, res, next) => {
    try {
        const doctorsGetted = await doctorsService.getSchedules(req.user);
    
            return res.status(200).json({ success: true, data: doctorsGetted })
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint que retorna un doctor de la colección mediante su ID
 * Param: ID del doctor
 * Respuesta:
 *        200: retorna un JSON con estado y objeto doctor
 *        403: Error. Un doctor pidió la ficha de otro doctor
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getDoctorById = async (req, res, next) => {
    try {
        const doctorID = req.params.id.trim();
        const doctorGetted = await doctorsService.findById(doctorID, req.user);
            return res.status(200).json({ success: true, data: doctorGetted })
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint que actualiza un doctor mediante su ID
 * Params: ID del doctor
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta:
 *        201: retorna un JSON con estado y objeto doctor actualizado
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */
export const updateDoctor = async (req, res, next) => {
    try {
        // DTO de Request
        const doctorData = new UpdateDoctorRequestDTO(req.body);
        const idDoctor = req.params.id;
        const doctorUpdated = await doctorsService.update(idDoctor, doctorData);
        return res.status(200).json({ success: true, data: doctorUpdated })

    } catch (error) {
        next(error);
    }
};