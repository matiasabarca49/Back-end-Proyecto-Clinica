import BaseService from "../../core/services/base.service.js";
import MongoRepository from "../../core/repositories/implementations/mongo.repository.js";
import { Patient } from "./patient.model.js";
import { PatientDTO } from "./patient.dto.js";
//Exception
import {ConflictError, NotFoundError, ServiceUnavailableError} from '../../core/exceptions/index.js'
import { requiredEnvVars } from "../../config/env.config.js";
import { validateEnvVars } from "../../utils/dotenv.helper.js";
import logger from "../../core/logger/logger.js";
import { searchRegex } from "../../shared/utils/regex.helper.js";
import { DoctorsService } from "../doctor/index.js";

const doctorsService = new DoctorsService();

class PatientsService extends BaseService {

    constructor() {
        const repository = new MongoRepository(Patient);
        super(repository);
    }

    async findAll(filters = {}) {
        const patients = await super.findAll({ ...filters, active: true });
        return this.toManyDTO(patients);
    }

    async findById(id) {
        const patient = await super.findActiveById(id);
        if (!patient) throw new NotFoundError("Paciente", id);
        return this.toDTO(patient);
    }

    async getOdontogram(patientID){
        const patient = await super.findActiveById(patientID)
        if (!patient) throw new NotFoundError("Paciente", patientID);
        return patient.dentalStatus 
    }

    async paginatePatients(filters = {}, limit, page, sort) {

        if(filters.search){
            const regex = searchRegex(filters.search);
            filters = {...filters,
                $or: [
                    { name: regex },
                    { lastName: regex },
                    { email: regex },
                    { dni: regex },
                    { medicalCoverage: regex }

                ]
            };

            delete filters.search; // Eliminar la propiedad search del objeto filters
        }
        filters = { ...filters, active: true };
        
        //Default sort: fecha de creación descendente
        const defaultSort = sort ? {lastName: parseInt(sort)} : {lastName: -1}
        
        const result = await this.repository.findPaginate(filters, limit, page, defaultSort);
        result.docs = this.toManyDTO(result.docs);
        
        return result;
    }

    /**
     * @param {String} query Texto a buscar
     * @param {Object} [options] limit, page, sort de la paginación.
     *                           includeInactive: incluye a los dados de baja. Lo usa el filtro por nombre del
     *                           listado de turnos, para que el historial de un paciente dado de baja se siga encontrando
     */
    async searchPaginate(query, { limit, page, sort, includeInactive = false } = {}) {
        const regex = searchRegex(query);
        let dftQuery = {
            $or: [
                { name: regex },
                { lastName: regex },
                { email: regex },
                { dni: regex }
            ]
        };
        if (!includeInactive) dftQuery.active = true;

        const result = await this.repository.findPaginate(dftQuery, limit, page, sort);
        result.docs = this.toManyDTO(result.docs);
        return result;
    }

    async create(newPatient, userSession) {
        // Asignar el doctor si el usuario que crea es un doctor. Para el caso de un admin o Employee, se debe
        // especificar el idDoctor en el newPatient.
        newPatient.idDoctor = userSession.rol === "Doctor"
            ? userSession.id
            : newPatient.idDoctor;

        // Lanza NotFoundError si el doctor no existe o fue dado de baja
        await doctorsService.findById(newPatient.idDoctor);

        newPatient.status = 'active';

        const patientDTO = new PatientDTO(newPatient);
        const created = await super.create(patientDTO);
        
        return this.toDTO(created);
    }

    async update(id, toUpdate) {
        // Si cambia el doctor asignado: NotFoundError si no existe o fue dado de baja
        if (toUpdate.idDoctor) await doctorsService.findById(toUpdate.idDoctor);

        // Un paciente dado de baja no se edita: da 404
        const updated = await this.repository.updateByFilter({ _id: id, active: true }, this.toUpdateDTO(toUpdate));
        if (!updated) throw new NotFoundError("Paciente", id);
        return this.toDTO(updated);
    }

    async getPDF(patientId){

        if(!validateEnvVars("pdf")){
            throw new ServiceUnavailableError(`Servicio no configurado`)
        }

        const patient = await super.findActiveById(patientId);

        if (!patient) throw new NotFoundError("Paciente", patientId);

        let response;
        
        try{
            response = await fetch(
               `${requiredEnvVars.PDF_SERVICE_URL}/medical-history-pdf`,
               {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json"
                   },
                   body: JSON.stringify(patient)
               }
           );
        }catch(error){
            throw new ServiceUnavailableError(`El servicio de generación de PDF no está disponible`)
        }

        if (!response.ok) {
            if (response.status === 422) {
                const res = await response.json();
                logger.error(res.detail);
                throw new ServiceUnavailableError(`Error de validación al generar el PDF. Datos del paciente inválidos.`);
            }

            throw new ServiceUnavailableError(`Error al generar el PDF`);
        }


        const pdfBuffer = Buffer.from(await response.arrayBuffer());

        //capturár el nombre generado por el microservicio de PDF
        let filename = "historia-clinica.pdf"; // fallback por si algo falla

        const contentDisposition = response.headers.get("content-disposition");
        
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) {
                filename = match[1];
            }
        }

        return { filename, pdfBuffer };
    }

    async addObservation(patientId, observation){
        const patientUpdated = await this.repository.updateByFilter(
            {_id: patientId, active: true},
            { $push: { observations: observation } }
        );

        if (!patientUpdated) throw new NotFoundError("Paciente", patientId);

        return this.toDTO(patientUpdated);
    }

    async addTreatment(patientId, treatment){
        const patientUpdated = await this.repository.updateByFilter(
            {_id: patientId, active: true},
            { $push: { treatments: treatment } }
        );

        if (!patientUpdated) throw new NotFoundError("Paciente", patientId);

        return this.toDTO(patientUpdated);
    }


    async updateTooth(patientId, toothId, toothData){
        const patient = await super.findActiveById(patientId)
        if(!patient) throw new NotFoundError("Paciente", patientId)

        const toothNumber = parseInt(toothId);
        
        const dentalStatus = patient.dentalStatus

        // Buscar si el diente ya existe en el array
        const toothIndex = dentalStatus.findIndex(
            tooth => tooth.tooth === toothNumber
        );

        if (toothIndex !== -1) {
            // El diente existe → Actualizar
            dentalStatus[toothIndex] = {
                ...dentalStatus[toothIndex].toObject(),
                ...toothData,
                   tooth: toothNumber // Asegurar que el número no cambie
            };
        } else {
            // El diente NO existe → Agregar (push)
            dentalStatus.push({
                tooth: toothNumber,
                ...toothData
            });
        }

        // active en el filtro: si se dio de baja después de leerlo, no se escribe
        const updatedPatient = await this.repository.updateByFilter({ _id: patientId, active: true }, {dentalStatus: dentalStatus});
        if (!updatedPatient) throw new NotFoundError("Paciente", patientId);

        return updatedPatient;
    }

    async delete(id) {
        // Import diferido: appointment.service crea un PatientsService al cargarse, así que un import
        // estático armaría un ciclo entre los dos módulos y uno de ellos quedaría sin inicializar
        const { AppointmentsService } = await import("../appointment/index.js");
        if (await new AppointmentsService().hasOpenAppointments({ patientID: id })) {
            throw new ConflictError("El paciente tiene turnos sin cerrar. Cancele o marque como ausente sus turnos antes de darlo de baja");
        }

        // Soft delete: el paciente queda con active en false para no romper sus turnos
        const patient = await super.deactivate(id);
        if (!patient) throw new NotFoundError("Paciente", id);

        return this.toDTO(patient);
    }
    
    async deleteObservation(patientId, idObservation){
        const patient = await super.findActiveById(patientId);

        if (!patient) throw new NotFoundError("Paciente", patientId);

        const updatedPatient = await this.repository.updateByFilter(
            { _id: patientId, active: true },
            { $pull: { observations: { _id: idObservation } } }
        );

        if (!updatedPatient) throw new NotFoundError("Observación", idObservation);
    }

    async deleteTreatment(patientId, idTreatment){
        const patient = await super.findActiveById(patientId);
        if (!patient) throw new NotFoundError("Paciente", patientId);
        
        // El tratamiento en el filtro: si no existe, no hay documento que coincida y se responde 404
        const updatedPatient = await this.repository.updateByFilter(
            { _id: patientId, active: true, "treatments._id": idTreatment },
            { $pull: { treatments: { _id: idTreatment } } }
        );

        if (!updatedPatient) throw new NotFoundError("Tratamiento", idTreatment);

    }
    
    async resetOdontogram(patientId){
        const patient = await super.findActiveById(patientId);
        if(!patient) throw new NotFoundError("Paciente", patientId);
        
        // active en el filtro: si se dio de baja después de leerlo, no se escribe
        const updatedPatient = await this.repository.updateByFilter({ _id: patientId, active: true }, {dentalStatus: []})
        if (!updatedPatient) throw new NotFoundError("Paciente", patientId);

        return true
        
    }

    /**
     * Fusionar en el odontograma del paciente los dientes tratados en un turno
     *
     * Cada diente recibido reemplaza al del paciente con el mismo número.
     * Se hace en una sola operación (update con pipeline), así que es atómica.
     *
     * @param {String} patientId ID del paciente
     * @param {Array} teeth Dientes completos (toothSchema) como objetos planos
     * @param {Object} options Dentro de una transacción, { session } de quien la abrió
     * @returns {Array} Odontograma del paciente actualizado
     */
    async mergeOdontogram(patientId, teeth, options = {}){
        const toothNumbers = teeth.map(t => t.tooth);

        const updatedPatient = await this.repository.updateByFilter(
            { _id: patientId },
            [{
                $set: {
                    dentalStatus: {
                        $concatArrays: [
                            {
                                // Dientes del paciente que no se tocaron en el turno
                                $filter: {
                                    input: { $ifNull: ["$dentalStatus", []] },
                                    cond: { $not: { $in: ["$$this.tooth", toothNumbers] } }
                                }
                            },
                            // $literal: los valores se guardan tal cual, sin interpretarse como expresiones
                            { $literal: teeth }
                        ]
                    }
                }
            }],
            options
        );

        if (!updatedPatient) throw new NotFoundError("Paciente", patientId);

        return updatedPatient.dentalStatus;
    }

    // ================= DTO mappers =================

    toDTO(patient) {
        return PatientDTO.toResponse(patient);
    }

    toManyDTO(patients) {
        return patients.map(p => PatientDTO.toResponse(p));
    }

    toFormatDTO(data) {
        return new PatientDTO(data);
    }

    toUpdateDTO(data) {
        return PatientDTO.toUpdate(data);
    }
}

export default PatientsService;