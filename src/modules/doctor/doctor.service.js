//Model
import { Doctor } from "./doctor.model.js";
//Base Service
import BaseService from '../../core/services/base.service.js';
//Repository
import MongoRepository from "../../core/repositories/implementations/mongo.repository.js";
//DTO
import { DoctorDTO, DoctorScheduleResponseDTO } from "./doctor.dto.js";

import { ForbiddenError, NotFoundError, ValidationError } from "../../core/exceptions/index.js";
import { searchRegex } from "../../shared/utils/regex.helper.js";

export default class DoctorsService extends BaseService{
    constructor() {
        const repository = new MongoRepository(Doctor);
        super(repository);
    }

    async findAll(){
        const doctors = await super.findAll({ active: true })
        return this.toManyDTO(doctors)
    }

    /**
     * @param {String} id ID del doctor
     * @param {Object} [user] Usuario autenticado (req.user): un doctor solo puede pedir su propia ficha.
     *                        Sin user (llamadas internas de otras features) no se restringe.
     */
    async findById(id, user){
        // Antes de consultar: un doctor no debe poder distinguir ids existentes (404) de ajenos (403)
        if (user?.rol === "doctor" && String(id).toLowerCase() !== String(user.id)) {
            throw new ForbiddenError("Un doctor solo puede ver su propia ficha")
        }
        const doctor = await super.findActiveById(id)
        if(!doctor) throw new NotFoundError("Doctor", id)
        return this.toDTO(doctor)
    }

    // Incluye a los dados de baja: la usa el filtro por nombre del listado de turnos, para que su historial se siga encontrando
    async searchPaginate(query){
        const regex = searchRegex(query)
        const resultPaginate = await this.repository.findPaginate({
            $or:[
                {name: regex},
                {name_search: regex},
                {lastName: regex},
                {dni: regex},
                {professionalLicense: regex}
            ]
        })
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    async paginateDoctors(search, limit, page, sort){
        //Default query: {}
        let filter = {};
        if(search){
            const regex = searchRegex(search);
            filter = {
                $or: [
                    { name: regex },
                    { lastName: regex },
                    { email: regex },
                    { dni: regex }
                ]
            };
        }
        filter.active = true;

        //Default sort: fecha de creación descendente
        const defaultSort = sort ? {lastName: parseInt(sort)} : {lastName: -1}
        const resultPaginate = await this.repository.findPaginate(filter, limit, page, defaultSort)
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    /**
     * @param {Object} [user] Usuario autenticado (req.user): un doctor solo recibe su propio horario.
     *                        Sin user (llamadas internas de otras features) no se restringe.
     */
    async getSchedules(user){
        // El _id de la ficha del doctor es el mismo que el de su usuario
        const filters = user?.rol === "doctor" ? { _id: user.id, active: true } : { active: true }
        const doctors = await super.findAll(filters)
        return this.toManyScheduleDTO(doctors)
    }

    async create(newDoctor, options = {}) {
        const newDoctorFormated = new DoctorDTO(newDoctor);
        // options: dentro de una transacción trae la session de quien la abrió
        return await super.create(newDoctorFormated, options);
    }

    async delete(doctorID, options = {}) {
        // options: dentro de una transacción trae la session de quien la abrió
        // Soft delete: la ficha queda con active en false para no romper sus turnos
        const deletedDoctor = await super.deactivate(doctorID, options);
        if (!deletedDoctor) {
            throw new NotFoundError("Doctor", doctorID);
        }
        return this.toDTO(deletedDoctor);
    }

    async update(doctorID, toUpdate, options = {}) {
        toUpdate.lastChange = new Date();
        // options: dentro de una transacción trae la session de quien la abrió
        // Una ficha dada de baja no se edita: da 404
        const dcotorUpdated = await this.repository.updateByFilter({ _id: doctorID, active: true }, toUpdate, options);
        if (!dcotorUpdated) {
            throw new NotFoundError("Doctor", doctorID);
        }
        return this.toDTO(dcotorUpdated);
    }

    //Métodos de mapeo DTO
    toFormatDTO(doctorData) {
        return new DoctorDTO(doctorData)
    }

    toDTO(doctor) {
        return DoctorDTO.toResponse(doctor)
    }

    toManyDTO(doctors) {
        return doctors.map(doctor => DoctorDTO.toResponse(doctor));
    }

    toManyScheduleDTO(doctors){
        return doctors.map(doctor => new DoctorScheduleResponseDTO(doctor))
    }
}