import IRepository from "../base/IRepository.js";
import {DuplicateError, ValidationError} from '../../exceptions/index.js'

class MongoRepository extends IRepository{
    constructor(model) {
        super();
        this.model = model;
    }

    //"Model" hace referencia al "Schema" de una colección
    async findAll(){
        //Si la respuesta tiene exito, devuelve los documentos encontrados
        return await this.model.find()
            //Si hay un error, lo muestra por consola y lo lanza para que lo capte la capa superior(Controlador/Servicio)
            .catch(error =>{
                console.log(error)
                throw error
            })
    }

    async findByID(ID){
        return await this.model.findOne({_id: ID})
            .catch(error =>{
                if(error.name === "CastError"){
                    throw new ValidationError("El ID no corresponde a un ID de Mongo")
                }
                throw error
            })
    
    }

    async findByFilter(filter){
        return await this.model.findOne(filter)
            .catch(error =>{
                console.log(error)
                throw error
            })
    }

    async aggregate(pipeline){
        return await this.model.aggregate(pipeline)
            .catch(error =>{
                console.log(error)
                throw error
            })
    }

    async findManyByFilter(filter){
        return await this.model.find(filter)
            .catch(error =>{
                console.log(error)
                throw error
            })
    }

    async findPaginate(query ,lmit , pag , srt){
        return await this.model.paginate(query || {} ,{limit: lmit || 10 , page: pag || 1, sort: srt || {}})
            .catch(error =>{
                console.log(error)
                throw error
            })
    }

    async create(newDocument){
        //Verificamos que el documento sea valido con el esquema(modelo)
        const model = new this.model(newDocument)
        return await model.save()
            .catch( error => {
                if (error.code === 11000) {
                    throw new DuplicateError(Object.keys(error.keyPattern), Object.values(error.keyValue))
                }
                throw error
            } )   
    }

    async createMany(arrayProducts){ 
        return await this.model.insertMany(arrayProducts)
            .catch( err =>{
                console.log(err)
                throw err
            })
    }

    async update(ID,toUpdate ){
       return await this.model.updateOne({_id: ID}, toUpdate)
            .catch( err =>{
                console.log(err)
                throw err
            })
    }

    // Actualiza un documento sin modificar los timestamps
    async updateWhioutTStamp(ID,toUpdate ){
       return await this.model.updateOne({_id: ID}, toUpdate, {timestamps: false})
            .catch( err =>{
                console.log(err)
                throw err
            })
    }

    async delete(ID){
        const documentToDelete = await this.findByID(ID)
        let documentDeleted 
        await this.model.deleteOne({_id: ID})
            .then( dt =>{
                documentDeleted = documentToDelete
            } )
            .catch( err => {
                console.log(err)
                documentDeleted= false
            } )
        return documentDeleted
    }
    
    async deleteByFilter(filter){
        const documentToDelete = await this.findByFilter(filter)
        let documentDeleted 
        await this.model.deleteOne(filter)
            .then( dt =>{
                documentDeleted = documentToDelete
            } )
            .catch( err => {
                console.log(err)
                documentDeleted= false
            } )
        return documentDeleted
    }

    async deleteManyByFilter(filter){
        let documentsDeleted 
        await this.model.deleteMany(filter)
            .then( dt =>{
                documentsDeleted = dt
            } )
            .catch( err => {
                console.log(err)
                documentsDeleted= false
            } )
        return documentsDeleted
    }
}

export default MongoRepository;