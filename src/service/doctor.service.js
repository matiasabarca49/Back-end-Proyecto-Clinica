import mongoose from "mongoose";
//Model
import { Doctor } from "../model/mongo/doctor.model.js"
//Base Service
import BaseService from './base.service.js'
//Repository
import MongoRepository from "../repositories/implementations/mongo.repository.js";
//DTO
import { DoctorDTO } from "../dto/doctor.dto.js";

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

    async findByFilter(filter){
        //Repository
        const doctor = await super.findByFilter(filter)
        return doctor ? this.toDTO(doctor) : undefined
    }

    async findManyByFilter(filter){
        const doctors = await super.findManyByFilter(filter) 
        return this.toManyDTO(doctors)
    }

    async findByFilterOrFail(filter){
        const doctor = await super.findByFilter(filter)
        if(!doctor) throw new Error('Doctor no encontrado')
        return this.toDTO(doctor)
    }

    async findById(id){
        const doctor = await super.findById(id)
        if(!doctor) throw new Error('Doctor no encontrado')
        return this.toDTO(doctor)
    }

    async findPaginate(dftQuery, dftLimit, dftPage, dftSort){
        const resultPaginate = await super.findPaginate(dftQuery, dftLimit, dftPage, dftSort)
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    async getDoctorByQuery(query){
        const searchRegex = new RegExp(query, 'i')
        const resultPaginate = await super.findPaginate({
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

    async createDoctor(newDoctor) {
        // Asignar fechas de creación y última modificación
        newDoctor.created = new Date();
        newDoctor.lastChange = new Date();
        
        const newDoctorFormated = new DoctorDTO(newDoctor);
        const doctorAdded = await super.create(newDoctorFormated);

        if (!doctorAdded) {
            throw new Error("Error al crear el doctor");
        }

        return doctorAdded
    }

    delete(doctorID) {
        return super.delete(doctorID);
    }

    update(doctorID, toUpdate) {
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
}