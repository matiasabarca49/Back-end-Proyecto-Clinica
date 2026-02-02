import DoctorsService from "../service/doctor.service.js";
import { CreateDoctorDTO } from "../dto/doctor.dto.js";

const doctorsService = new DoctorsService();

/**
 * Endpoint que retorna todos los doctores de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de doctores
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getDoctors = async (req, res) => {
    try {
        const {search, sort, page, limit } = req.query;
        let doctorsGetted;
        if(!page && !limit){
            doctorsGetted = await doctorsService.findAll();
        }else{
            doctorsGetted = await doctorsService.paginateDoctors(search, limit, page, sort);
        }
        doctorsGetted
            ? res.status(200).send({ status: "Succes", doctors: doctorsGetted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en getDoctors:", error);
        return res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

/**
 * Endpoint que retorna un doctor de la colección mediante su ID
 * Param: ID del doctor
 * Respuesta:
 *        200: retorna un JSON con estado y objeto doctor
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getDoctorById = async (req, res) => {
    try {
        const doctorID = req.params.id.trim();
        const doctorGetted = await doctorsService.findById(doctorID);
        doctorGetted
            ? res.status(200).send({ status: "Succes", doctors: doctorGetted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en getDoctorById:", error);
        return res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

/**
 * Endpoint que crea un nuevo doctor en la colección de doctores
 * Body: Objeto Doctor
 * Respuesta:
 *        201: retorna un JSON con estado y objeto doctor creado
 *        404: Error. Datos inválidos o solicitud mal hecha
 */
export const createDoctor = async (req, res) => {
    try {
        // Crear DTO de Borde de creación de doctor
        const doctor = new CreateDoctorDTO(req.body);

        const doctorCreated = await doctorsService.create(doctor);
        
        if (!doctorCreated.status) {
            if (doctorCreated.error.code === 11000) {
                res.status(409).send({ status: "ERROR", code: 11000 });
            } else {
                res.status(500).send({ status: "ERROR" });
            }
        } else {
            res.status(201).send({ status: "Success", doctors: doctorCreated.dt });
        }
    } catch (error) {
        console.error("Error en createDoctor:", error);
        return res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};

/**
 * Endpoint que elimina un doctor de la colección mediante su ID
 * Params: ID del doctor
 * Respuesta:
 *        200: retorna un JSON con estado y objeto del doctor eliminado
 *        404: Error. El ID no existe en la DB o solicitud mal hecha
 */
export const deleteDoctor = async (req, res) => {
    try {
        const doctorID = req.params.id;
        const doctorDeleted = await doctorsService.delete(doctorID);
        doctorDeleted
            ? res.status(200).send({ status: "Succes", doctors: doctorDeleted })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en deleteDoctor:", error);
        return res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
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
export const updateDoctor = async (req, res) => {
    try {
        const doctorData = req.body;
        const idDoctor = req.params.id;
        const doctorUpdated = await doctorsService.update(idDoctor, doctorData);
        doctorUpdated
            ? res.status(201).send({ status: "Succes", doctors: doctorUpdated })
            : res.status(404).send({ status: "ERROR" });
    } catch (error) {
        console.error("Error en updateDoctor:", error);
        return res.status(500).send({ status: "ERROR", message: "Error en el servidor" });
    }
};