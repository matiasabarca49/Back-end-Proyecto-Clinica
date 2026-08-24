import BaseService from "../../core/services/base.service.js";
import MongoRepository from "../../core/repositories/implementations/mongo.repository.js";
import { Patient } from "./patient.model.js";
import { PatientDTO } from "./patient.dto.js";
//Exception
import {NotFoundError, ServiceUnavailableError} from '../../core/exceptions/index.js'

class PatientsService extends BaseService {

    constructor() {
        const repository = new MongoRepository(Patient);
        super(repository);
    }

    async findAll(filters = {}) {
        const patients = await super.findAll(filters);
        return this.toManyDTO(patients);
    }

    async findById(id) {
        const patient = await super.findById(id);
        if (!patient) throw new NotFoundError("Paciente", id);
        return this.toDTO(patient);
    }

    async getOdontogram(patientID){
        const patient = await super.findById(patientID)
        if (!patient) throw new NotFoundError("Paciente", id);
        return patient.dentalStatus 
    }

    async paginatePatients(filters = {}, limit, page, sort) {

        if(filters.search){
            const regex = new RegExp(filters.search, "i");
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
        
        //Default sort: fecha de creación descendente
        const defaultSort = sort ? {lastName: parseInt(sort)} : {lastName: -1}
        
        const result = await this.repository.findPaginate(filters, limit, page, defaultSort);
        result.docs = this.toManyDTO(result.docs);
        
        return result;
    }

    async searchPaginate(query, dftLimit, dftPage, dftSort, userSession) {
        const regex = new RegExp(query, "i");
        let dftQuery = {
            $or: [
                { name: regex },
                { lastName: regex },
                { email: regex },
                { DNI: regex }
            ]
        };

        const result = await this.repository.findPaginate(dftQuery, dftLimit, dftPage, dftSort);
        result.docs = this.toManyDTO(result.docs);
        return result;
    }

    async create(newPatient, userSession) {
        // Asignar el doctor si el usuario que crea es un doctor. Para el caso de un admin o Employee, se debe
        // especificar el idDoctor en el newPatient.
        newPatient.idDoctor = userSession.rol === "Doctor"
            ? userSession.id
            : newPatient.idDoctor;

        newPatient.status = 'active';

        const patientDTO = new PatientDTO(newPatient);
        const created = await super.create(patientDTO);
        
        return this.toDTO(created);
    }

    async update(id, toUpdate) {
        const updated = await super.update(id, this.toUpdateDTO(toUpdate));
        if (!updated) throw new NotFoundError("Paciente", id);
        return updated;
    }

    async getPDF(patientId){
        const patient = await super.findById(patientId);

        if (!patient) throw new NotFoundError("Paciente", patientId);

        let response;
        
        try{
            response = await fetch(
               `${process.env.PDF_SERVICE_URL}/medical-history-pdf`,
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
                console.error(res.detail);
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
            {_id: patientId},
            { $push: { observations: observation } }
        );

        if (!patientUpdated) throw new NotFoundError("Paciente", patientId);

        return this.toDTO(patientUpdated);
    }

    async addTreatment(patientId, treatment){
        const patientUpdated = await this.repository.updateByFilter(
            {_id: patientId},
            { $push: { treatments: treatment } }
        );

        if (!patientUpdated) throw new NotFoundError("Paciente", patientId);

        return this.toDTO(patientUpdated);
    }


    async updateTooth(patientId, toothId, toothData){
        const patient = await super.findById(patientId)
        if(!patient) throw new NotFoundError("Paciente", id)

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

        const updatedPatient = await super.update(patientId, {dentalStatus: dentalStatus});

        return updatedPatient;
    }

    async delete(id) {
        const patient = await super.findById(id);
        if (!patient) throw new NotFoundError("Paciente", id);

        await super.delete(id);
        return this.toDTO(patient);
    }
    
    async deleteObservation(patientId, idObservation){
        const patient = await super.findById(patientId);

        if (!patient) throw new NotFoundError("Paciente", patientId);

        const updatedPatient = await this.repository.updateByFilter(
            { _id: patientId },
            { $pull: { observations: { _id: idObservation } } }
        );

        if (!updatedPatient) throw new NotFoundError("Observación", idObservation);
    }

    async deleteTreatment(patientId, idTreatment){
        const patient = await super.findById(patientId);
        if (!patient) throw new NotFoundError("Paciente", patientId);
        
        const updatedPatient = await this.repository.updateByFilter(
            { _id: patientId },
            { $pull: { treatments: { _id: idTreatment } } }
        );
    
    }
    
    async resetOdontogram(patientId){
        const patient = await super.findById(patientId);
        if(!patient) throw new NotFoundError("Paciente", id);
        
        await super.update(patientId, {dentalStatus: []})

        return true
        
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