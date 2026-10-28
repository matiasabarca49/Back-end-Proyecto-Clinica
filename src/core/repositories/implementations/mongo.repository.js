import mongoose from "mongoose";
import IRepository from "../base/IRepository.js";
import {DuplicateError, ValidationError} from '../../exceptions/index.js'
import logger from '../../logger/logger.js'

// Traduce los errores de Mongo/Mongoose a errores de la app, para que el middleware responda 4xx y no 500.
// Los demás errores se registran y se relanzan tal cual
const toAppError = (err) => {
    // insertMany no trae keyPattern en la raíz: sin el campo, se relanza el error original
    if (err.code === 11000 && err.keyPattern) {
        return new DuplicateError(Object.keys(err.keyPattern).join(", "))
    }
    if (err instanceof mongoose.Error.ValidationError) {
        return new ValidationError(`Datos inválidos: ${Object.keys(err.errors).join(", ")}`)
    }
    if (err instanceof mongoose.Error.CastError) {
        return new ValidationError(err.path === "_id"
            ? "El ID no corresponde a un ID de Mongo"
            : `Valor inválido para ${err.path}`)
    }
    logger.error({ message: "Error en MongoRepository", error: err.message, stack: err.stack })
    return err
}

// Los updates corren los validadores del esquema (enum, required, min, ...) sobre los campos que se envían.
// context 'query': dentro de un validador, `this` es la consulta y no queda undefined
const VALIDATION_OPTIONS = { runValidators: true, context: 'query' }
// new: los findOneAndUpdate devuelven el documento ya actualizado
const UPDATE_OPTIONS = { ...VALIDATION_OPTIONS, new: true }

// Todos los métodos (salvo findPaginate) reciben `options` y lo pasan a Mongoose.
// Dentro de una transacción se usa { session }: sin ella, la operación corre fuera de la transacción
class MongoRepository extends IRepository{
    constructor(model) {
        super();
        this.model = model;
    }

    //"Model" hace referencia al "Schema" de una colección
    async findAll(filters = {}, options = {}){
        return await this.model.find(filters, null, options)
            .catch(err => { throw toAppError(err) })
    }

    async findByID(ID, options = {}){
        return await this.model.findOne({_id: ID}, null, options)
            .catch(err => { throw toAppError(err) })
    }

    async findByFilter(filter, options = {}){
        return await this.model.findOne(filter, null, options)
            .catch(err => { throw toAppError(err) })
    }

    async aggregate(pipeline, options = {}){
        return await this.model.aggregate(pipeline, options)
            .catch(err => { throw toAppError(err) })
    }

    async findManyByFilter(filter, options = {}){
        return await this.model.find(filter, null, options)
            .catch(err => { throw toAppError(err) })
    }

    async findPaginate(query ,lmit , pag , srt){
        return await this.model.paginate(query || {} ,{limit: lmit || 10 , page: pag || 1, sort: srt || {}})
            .catch(err => { throw toAppError(err) })
    }

    async create(newDocument, options = {}){
        //Verificamos que el documento sea valido con el esquema(modelo)
        const model = new this.model(newDocument)
        return await model.save(options)
            .catch(err => { throw toAppError(err) })
    }

    async createMany(arrayProducts, options = {}){
        return await this.model.insertMany(arrayProducts, options)
            .catch(err => { throw toAppError(err) })
    }

    // Devuelve el documento actualizado, o null si no existe
    async update(ID, toUpdate, options = {}){
       return await this.model.findByIdAndUpdate(ID, toUpdate, { ...UPDATE_OPTIONS, ...options })
            .catch(err => { throw toAppError(err) })
    }

    // Actualiza un documento sin modificar los timestamps
    async updateWhioutTStamp(ID, toUpdate, options = {}){
       return await this.model.updateOne({_id: ID}, toUpdate, { ...VALIDATION_OPTIONS, timestamps: false, ...options })
            .catch(err => { throw toAppError(err) })
    }

    async updateByFilter(filter, toUpdate, options = {}){
        return await this.model.findOneAndUpdate(filter, toUpdate, { ...UPDATE_OPTIONS, ...options })
            .catch(err => { throw toAppError(err) })
    }

    // Devuelve el documento borrado, o null si no existe. Lee y borra en una sola operación atómica
    async delete(ID, options = {}){
        return await this.model.findOneAndDelete({_id: ID}, options)
            .catch(err => { throw toAppError(err) })
    }

    // Devuelve el documento borrado, o null si ninguno coincide
    async deleteByFilter(filter, options = {}){
        return await this.model.findOneAndDelete(filter, options)
            .catch(err => { throw toAppError(err) })
    }

    async deleteManyByFilter(filter, options = {}){
        return await this.model.deleteMany(filter, options)
            .catch(err => { throw toAppError(err) })
    }
}

export default MongoRepository;
