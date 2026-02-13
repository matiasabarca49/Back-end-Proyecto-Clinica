import DoctorsService from "../service/doctor.service.js";
import { CreateDoctorDTO } from "../dto/doctor.dto.js";

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
 * Endpoint que retorna los horarios de todos los doctores de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de doctores
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getSchedules = async (req, res, next) => {
    try {
        const doctorsGetted = await doctorsService.getSchedules();
    
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
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getDoctorById = async (req, res, next) => {
    try {
        const doctorID = req.params.id.trim();
        const doctorGetted = await doctorsService.findById(doctorID);
            return res.status(200).json({ success: true, data: doctorGetted })
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint que crea un nuevo doctor en la colección de doctores
 * Body: Objeto Doctor
 * Respuesta:
 *        201: retorna un JSON con estado y objeto doctor creado
 *        404: Error. Datos inválidos o solicitud mal hecha
 */
export const createDoctor = async (req, res, next) => {
    try {
        // Crear DTO de Borde de creación de doctor
        const doctor = new CreateDoctorDTO(req.body);

        const doctorCreated = await doctorsService.create(doctor);
        return res.status(201).json({ success: true, data: doctorCreated });
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint que elimina un doctor de la colección mediante su ID
 * Params: ID del doctor
 * Respuesta:
 *        200: retorna un JSON con estado y objeto del doctor eliminado
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */
export const deleteDoctor = async (req, res, next) => {
    try {
        const doctorID = req.params.id;
        const doctorDeleted = await doctorsService.delete(doctorID);
            return res.status(200).json({ success: true, data: doctorDeleted })
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
        const doctorData = req.body;
        const idDoctor = req.params.id;
        const doctorUpdated = await doctorsService.update(idDoctor, doctorData);
        return res.status(201).json({ success: true, data: doctorUpdated })

    } catch (error) {
        next(error);
    }
};