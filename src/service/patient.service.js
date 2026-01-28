import BaseService from "./base.service.js";
import MongoRepository from "../repositories/implementations/mongo.repository.js";
import { Patient } from "../model/mongo/patient.model.js";
import { PatientDTO } from "../dto/patient.dto.js";
import { normalizeText } from "../utils/utils.js";

class PatientsService extends BaseService {

    constructor() {
        const repository = new MongoRepository(Patient);
        super(repository);
    }

    async findAll(userSession) {
        let patients;

        if (userSession?.rol === "Doctor") {
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

    async findByFilter(filter) {
        const patients = await super.findManyByFilter(filter);
        return this.toManyDTO(patients);
    }

    async findPaginate(dftQuery, dftLimit, dftPage, dftSort, userSession) {
        if (userSession?.rol === "Doctor") {
            dftQuery = { ...dftQuery, idDoctor: userSession.id };
        }

        const result = await super.findPaginate(dftQuery, dftLimit, dftPage, dftSort);
        result.docs = this.toManyDTO(result.docs);
        return result;
    }

    async findByQuery(query) {
        const regex = new RegExp(query, "i");
        const patients = await super.findByQuery({
            $or: [
                { name: regex },
                { lastName: regex },
                { email: regex },
                { DNI: regex }
            ]
        });

        return this.toManyDTO(patients);
    }

    async create(newPatient, userSession) {

        const normalizedPatient = {
            ...newPatient,
            name: normalizeText(newPatient.name),
            lastName: normalizeText(newPatient.lastName),
            sex: normalizeText(newPatient.sex),
            idDoctor: userSession.rol === "Doctor"
                ? userSession.id
                : newPatient.idDoctor
        };

        const patientDTO = new PatientDTO(normalizedPatient);
        const created = await super.create(patientDTO);

        return this.toDTO(created);
    }

    async updatePatient(id, toUpdate) {
        const updated = await super.update(id, toUpdate);
        if (!updated) throw new Error("Paciente no encontrado");
        return this.toDTO(updated);
    }

    async deletePatient(id) {
        const patient = await super.findById(id);
        if (!patient) throw new Error("Paciente no encontrado");

        await super.delete(id);
        return this.toDTO(patient);
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