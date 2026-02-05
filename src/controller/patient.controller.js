import PatientsService from "../service/patient.service.js";
import { CreatePatientDTO } from "../dto/patient.dto.js";

const patientsService = new PatientsService();

/**
 * Endpoint que retorna todos los pacientes de la DB
 * Respuesta:
 *        200: retorna un JSON con estado y array de pacientes
 *        404: Error. Problema al obtener la colección de la DB
 */
export const getPatients = async (req, res) => {
    try {
        const {search, sex, sort, page, limit } = req.query;
        let patientsGetted;
        if(!page && !limit){
            patientsGetted = await patientsService.findAll();
        }else{
            patientsGetted = await patientsService.paginatePatients(search, sex, limit, page, sort);
        }
        patientsGetted
            ? res.status(200).send({ status: "Success", patients: patientsGetted })
            : res.status(404).send({ status: "ERROR", reason: "Los Pacientes no se pudieron obtener" });
    } catch (error) {
        console.error("Error en getPatients:", error);
        return res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Endpoint que retorna un paciente mediante su ID
 * Param: ID del paciente
 * Respuesta:
 *        200: retorna un JSON con estado y objeto paciente
 *        404: Error. ID incorrecto o no existe en la DB
 */
export const getPatientById = async (req, res) => {
    try {
        const patientID = req.params.id.trim();
        const patientGetted = await patientsService.findById(patientID);
        patientGetted
            ? res.status(200).send({ status: "Success", patients: patientGetted })
            : res.status(404).send({ status: "ERROR", reason: "Paciente no encontrado" });
    } catch (error) {
        console.error("Error en getPatientById:", error);
        return res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
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
export const getPatientByQuery = async (req, res) => {
    try {
        const { query } = req.query;
        const patientFounded = await patientsService.searchPaginate(query);
        patientFounded
            ? res.status(200).json({ success: true, data: patientFounded })
            : res.status(404).json({ success: false, error: "No se encontraron pacientes que coincidan" });
    } catch (error) {
        console.error("Error en getPatientByQuery:", error);
        return res.status(500).json({ success: false, error: "Error en el servidor, intente más tarde" });
    }
};

/**
 * Obtener el odontograma completo de un paciente
 * GET /api/patients/:patientId/odontogram
 */
export const getOdontogram = async (req, res) => {
  try {
    const { patientId } = req.params;

    const odontogram = await patientsService.getOdontogram(patientId)

    return res.status(200).json({
      success: true,
      data: odontogram || []
    });

  } catch (error) {
      console.error('Error al obtener odontograma:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error al obtener el odontograma',
        error: error.message 
      });
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
export const createPatient = async (req, res) => {
    try {
        // Crear DTO de Borde de creación de paciente
        const patient = new CreatePatientDTO(req.body);

        const patientCreated = await patientsService.create(patient, req.user);
    
        return res.status(201).send({ status: "Success", patients: patientCreated.dt });
    } catch (error) {
        console.error("Error en createPatient:", error);
        return res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intente más tarde" });
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
export const deletePatient = async (req, res) => {
    try {
        const patientID = req.params.id;
        const patientDeleted = await patientsService.delete(patientID);
        patientDeleted
            ? res.status(200).send({ status: "Success", patients: patientDeleted })
            : res.status(404).send({ status: "ERROR", reason: "Paciente no encontrado" });
    } catch (error) {
        console.error("Error en deletePatient:", error);
        return res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
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
export const updatePatient = async (req, res) => {
    try {
        const patientData = req.body;
        const idPatient = req.params.id.trim();
        const patientUpdated = await patientsService.update(idPatient, patientData);
        patientUpdated
            ? res.status(201).send({ status: "Success", patients: patientUpdated })
            : res.status(404).send({ status: "ERROR", reason: "Paciente no encontrado" });
    } catch (error) {
        console.error("Error en updatePatient:", error);
        return res.status(500).send({ status: "ERROR", reason: "Error en el servidor" });
    }
};

/**
 * Actualizar un diente específico
 * PUT /api/patients/:patientId/odontogram/:toothId
 * Body: { caries: {...}, corona: true, ... }
 */
export const updateTooth = async (req, res) => {
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
    console.error('Error al actualizar diente:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al actualizar el diente',
      error: error.message 
    });
  }
};

/**
 * Resetear odontograma (limpiar todos los dientes)
 * DELETE /api/patients/:patientId/odontogram
 */
export const resetOdontogram = async (req, res) => {
  try {
    const { patientId } = req.params;

    await patientsService.resetOdontogram(patientId);
    
    return res.status(200).json({
      success: true,
      message: 'Odontograma reseteado correctamente',
      data: []
    });

  } catch (error) {
    console.error('Error al resetear odontograma:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al resetear el odontograma',
      error: error.message 
    });
  }
};
