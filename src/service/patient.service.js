import BaseService from "./base.service.js";
import MongoRepository from "../repositories/implementations/mongo.repository.js";
import { Patient } from "../model/mongo/patient.model.js";
import { PatientDTO } from "../dto/patient.dto.js";

class PatientsService extends BaseService {

    constructor() {
        const repository = new MongoRepository(Patient);
        super(repository);
    }

    async findAll(userSession) {
        let patients;

        if (userSession?.rol === "doctor") {
            patients = await super.findManyByFilter({ idDoctor: userSession.id });
        } else {
            patients = await super.findAll();
        }

        return this.toManyDTO(patients);
    }

    async findById(id) {
        const patient = await super.findById(id);
        if (!patient) throw new Error("Paciente no encontrado");
        return this.toDTO(patient);
    }

    async getOdontogram(patientID){
        const patient = await super.findById(patientID)
        if(!patient) throw new Error("Paciente no encontrado")
        return patient.dentalStatus 
    }

    async paginatePatients(search, sex, limit, page, sort, userSession) {

        let filter = {};
        if(search){
            const regex = new RegExp(search, "i");
            filter = {
                $or: [
                    { name: regex },
                    { lastName: regex },
                    { email: regex },
                    { dni: regex },
                    { medicalCoverage: regex }

                ]
            };
        }
        if(sex){
            filter.sex = sex;
        }

        //Default sort: fecha de creación descendente
        const defaultSort = sort ? {lastName: parseInt(sort)} : {lastName: -1}
        
        if (userSession?.rol === "doctor") {
            dftQuery = { ...dftQuery, idDoctor: userSession.id };
        }

        const result = await this.repository.findPaginate(filter, limit, page, defaultSort);
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
        if (!created) throw new Error("Error al crear el paciente");
        return this.toDTO(created);
    }

    async update(id, toUpdate) {
        const updated = await super.update(id, toUpdate);
        if (!updated) throw new Error("Paciente no encontrado");
        return updated;
    }

    async updateTooth(patientId, toothId, toothData){
        const patient = await super.findById(patientId)
        if(!patient) throw new Error("Paciente no encontrado")

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
        if (!patient) throw new Error("Paciente no encontrado");

        await super.delete(id);
        return this.toDTO(patient);
    }

    async resetOdontogram(patientId){
        const patient = await super.findById(patientId);
        if(!patient) throw new Error("Paciente no encontrado");
        
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
}

export default PatientsService;