//Model
import { Doctor } from "../model/mongo/doctor.model.js"
//Base Service
import BaseService from './base.service.js'
//Repository
import MongoRepository from "../repositories/implementations/mongo.repository.js";
//DTO
import { DoctorDTO, DoctorScheduleResponseDTO } from "../dto/doctor.dto.js";

export default class DoctorsService extends BaseService{
    constructor() {
        const repository = new MongoRepository(Doctor);
        super(repository);
    }

    async findAll(){
        const doctors = await super.findAll()
        if(!doctors) throw new Error('Error interno del servidor')
        return this.toManyDTO(doctors)
    }

    async findById(id){
        const doctor = await super.findById(id)
        if(!doctor) throw new Error('Doctor no encontrado')
        return this.toDTO(doctor)
    }

    async searchPaginate(query){
        const searchRegex = new RegExp(query, 'i')
        const resultPaginate = await this.repository.findPaginate({
            $or:[
                {name: searchRegex},
                {name_search: searchRegex},
                {lastName: searchRegex},
                {dni: searchRegex},
                {professionalLicense: searchRegex}
            ]
        })
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    async paginateDoctors(search, limit, page, sort){
        //Default query: {}
        let filter = {};
        if(search){
            const regex = new RegExp(search, "i");
            filter = {
                $or: [
                    { name: regex },
                    { lastName: regex },
                    { email: regex },
                    { dni: regex }
                ]
            };
        }
        
        //Default sort: fecha de creación descendente
        const defaultSort = sort ? {lastName: parseInt(sort)} : {lastName: -1}
        const resultPaginate = await this.repository.findPaginate(filter, limit, page, defaultSort)
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    async getSchedules(){
        const doctors = await super.findAll()
        if(!doctors) throw new Error('Error interno del servidor')
        return this.toManyScheduleDTO(doctors)

    }

    async create(newDoctor) {
        const newDoctorFormated = new DoctorDTO(newDoctor);
        const doctorAdded = await super.create(newDoctorFormated);

        if (!doctorAdded) {
            throw new Error("Error al crear el doctor");
        }

        return doctorAdded
    }

    async delete(doctorID) {
        const deletedDoctor = await super.delete(doctorID); 
        return this.toDTO(deletedDoctor);
    }

    async update(doctorID, toUpdate) {
        toUpdate.lastChange = new Date()
        return super.update(doctorID, toUpdate);
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