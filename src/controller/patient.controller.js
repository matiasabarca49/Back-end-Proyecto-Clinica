/**
 * PATRÓN A SEGUIR:
 * 
 * const miFuncion = async (req, res, next) => {
 *   try {
 *     // 1. lógica
 *     // 2. Si hay error, throw new TipoError(...)
 *     // 3. Si todo bien, res.json(...)
 *   } catch (error) {
 *     next(error); // SIEMPRE pasar el error con next()
 *   }
 * };
 */

import PatientsService from "../service/patient.service.js";
import { CreatePatientDTO } from "../dto/patient.dto.js";

const patientsService = new PatientsService();

/**
 * Endpoint que retorna todos los pacientes de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de pacientes
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getPatients = async (req, res, next) => {
    try {
        const {search, sex, sort, page, limit } = req.query;
        let patientsGetted;
        if(!page && !limit){
            patientsGetted = await patientsService.findAll();
        }else{
            patientsGetted = await patientsService.paginatePatients(search, sex, limit, page, sort);
        }

        return res.status(200).json({ success: true, message: "Pacientes obtenidos correctamente", data: patientsGetted})
            
    } catch (error) {
        next(error)
    }
};

/**
 * Endpoint que retorna un paciente mediante su ID
 * Param: ID del paciente
 * Respuesta:
 *        200: retorna un JSON con estado y objeto paciente
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getPatientById = async (req, res, next) => {
    try {
        const patientID = req.params.id.trim();
        const patientGetted = await patientsService.findById(patientID);

        return res.status(200).json({ success: true, message:"Paciente obtenido correctamente",data: patientGetted })
            
    } catch (error) {
        next(error)
    }
};

/**
 * Endpoint que retorna pacientes filtrados por texto (búsqueda avanzada)
 * Query: { query: texto }
 * Respuesta:
 *        200: retorna un JSON con estado y array de pacientes encontrados
 *        404: Error. No se encontraron pacientes
 *        500: Error en el servidor
 */
export const getPatientByQuery = async (req, res, next) => {
    try {
        const { query } = req.query;
        const patientFounded = await patientsService.searchPaginate(query);
        
        return res.status(200).json({ success: true, data: patientFounded })
            
    } catch (error) {
        next(error)
    }
};

/**
 * Obtener el odontograma completo de un paciente
 * GET /api/patients/:patientId/odontogram
 */
export const getOdontogram = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const odontogram = await patientsService.getOdontogram(patientId)

    return res.status(200).json({
      success: true,
      message: "Odontograma obtenido correctamente",
      data: odontogram || []
    });

  } catch (error) {
      next(error)
  }
};

/**
 * Endpoint que crea un nuevo paciente en la colección
 * Body: Objeto Patient
 * Respuesta:
 *        201: retorna un JSON con estado y paciente creado
 *        409: Error. Paciente duplicado (code 11000)
 *        500: Error en el servidor
 */
export const createPatient = async (req, res, next) => {
    try {
        // Crear DTO de Borde de creación de paciente
        const patient = new CreatePatientDTO(req.body);

        const patientCreated = await patientsService.create(patient, req.user);
    
        return res.status(201).json({ success: true , message: "Paciente creado exitosamente" ,data: patientCreated });
    } catch (error) {
        next(error)
    }
};

/**
 * Endpoint que elimina un paciente de la colección mediante su ID
 * Params: ID del paciente
 * Respuesta:
 *        200: retorna un JSON con estado y paciente eliminado
 *        404: Error. El ID no existe en la DB
 *        500: Error en el servidor
 */
export const deletePatient = async (req, res, next) => {
    try {
        const patientID = req.params.id;
        const patientDeleted = await patientsService.delete(patientID);
        
        res.status(200).json({ success: true, message: "Paciente eliminado exitosamente", data: patientDeleted })
  
    } catch (error) {
        next(error)
    }
};

/**
 * Endpoint que actualiza un paciente mediante su ID
 * Params: ID del paciente
 * Body: Datos a actualizar -> { clave: valor }
 * Respuesta:
 *        201: retorna un JSON con estado y paciente actualizado
 *        404: Error. El ID no existe en la DB
 *        500: Error en el servidor
 */
export const updatePatient = async (req, res, next) => {
    try {
        const patientData = req.body;
        const idPatient = req.params.id.trim();
        const patientUpdated = await patientsService.update(idPatient, patientData);
        
        return res.status(201).json({ success: true, message: "Paciente actualizado" ,data: patientUpdated })
    } catch (error) {
        next(error)
    }
};

/**
 * Actualizar un diente específico
 * PUT /api/patients/:patientId/odontogram/:toothId
 * Body: { caries: {...}, corona: true, ... }
 */
export const updateTooth = async (req, res, next) => {
  try {
    const { patientId, toothId } = req.params;
    const toothData = req.body;

    const patientUpdated = await patientsService.updateTooth(patientId, toothId, toothData)

    return res.status(200).json({
      success: true,
      message: 'Diente actualizado correctamente',
      data: patientUpdated.dentalStatus
    });

  } catch (error) {
    next(error)
  }
};

/**
 * Resetear odontograma (limpiar todos los dientes)
 * DELETE /api/patients/:patientId/odontogram
 */
export const resetOdontogram = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    await patientsService.resetOdontogram(patientId);
    
    return res.status(200).json({
      success: true,
      message: 'Odontograma reseteado correctamente',
      data: []
    });

  } catch (error) {
    next(error)
  }
};
