import PersistController from "../../DAO/persist.dao.js"

class BaseService{

    constructor(model) {  
        this.model = model
        this.persistController = new PersistController(model)
    }

    async getAll(){
        const documents = await this.persistController.getDocuments()
        if(!documents || documents.length === 0) return []
        // Buscar si la clase hija definió toDTO
        //Wrapper Pattern
        return this.toManyDTO ? this.toManyDTO(documents) : documents
    }

    //Uso interno
    async getRawByFilter(filter){
        const document = await this.persistController.getDocumentByFilter(filter)
        if(!document || document.length === 0) return null
        // Buscar si la clase hija definió toDTO
        return document
    }

    async getByFilter(filter){
        const document = await this.persistController.getDocumentByFilter(filter)
        if(!document || document.length === 0) return null
        // Buscar si la clase hija definió toDTO
        return this.toDTO ? this.toDTO(document) : document
    }

    async getManyByFilter(filter){
        const document = await this.persistController.getManyDocumentsByFilter(filter)
        if(!document || document.length === 0) return null
        // Buscar si la clase hija definió toDTO
        return this.toManyDTO ? this.toManyDTO(document) : document
    }

    async getById(id){
        const document = await this.persistController.getDocumentByID(id)
        if(!document || document.length === 0) return null
        // Buscar si la clase hija definió toDTO
        return this.toDTO ? this.toDTO(document) : document
    }

    async getPaginate(dftQuery, dftLimit, dftPage, dftSort){
        const documents = await this.persistController.getPaginate(dftQuery, dftLimit, dftPage, dftSort)
        if(!documents || documents.docs.length === 0) return null
        // Buscar si la clase hija definió toManyDTO y formatear los documentos
        const documentsFormated = this.toManyDTO ? this.toManyDTO(documents.docs) : documents
        // Reemplazar los documentos originales por los formateados
        documents.docs = documentsFormated
        return documents
    }

    async getQuery(opAgregations){
        const usersGetted = await this.persistController.getDocumentsByQuery(opAgregations)
        if( !usersGetted || usersGetted.length === 0){
            return null
        }else{
            return this.toManyDTO?  this.toManyDTO(usersGetted) : usersGetted
        }
    }

    async create(document){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const documentCreated = await this.persistController.createNewDocument(this.toFormatDTO ? this.toFormatDTO(document) : document)

        //Si se produjo un error al crear el documento, lanzamos una excepción
        if (!documentCreated){ 
            throw new Error('Error al crear el documento')
        }
        // Buscar si la clase hija definió toDTO
        return this.toDTO ? this.toDTO(documentCreated) : documentCreated
    }

    async createMany(documents){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const documentsCreated = await this.persistController.createManyDocuments(this.toFormatDTO ? documents.map(document => this.toFormatDTO(document)) : documents)

        //Si se produjo un error al crear los documentos, lanzamos una excepción
        if (!documentsCreated || documentsCreated.length === 0){ 
            throw new Error('Error al crear los documentos')
        }
        // Buscar si la clase hija definió toDTO
        return this.toManyDTO ? this.toManyDTO(documentsCreated) : documentsCreated
    }

    async update(id, updatedDocument){
        return await this.persistController.updateDocument(id, updatedDocument)
    }

    async delete(id){
        return await this.persistController.deleteDocument(id)
    }
}

module.exports = BaseService