class BaseService{

    constructor(repository) {  
        //DIP
        this.repository = repository
    }

    async findAll(){
        //Repository
        const documents = await this.repository.findAll()
        if(!documents || documents.length === 0) return []
        // Buscar si la clase hija definió toDTO
        //Wrapper Pattern
        return this.toManyDTO ? this.toManyDTO(documents) : documents
    }

    //Uso interno
    async findRawByFilter(filter){
        //Repository
        const document = await this.repository.findByFilter(filter)
        if(Array.isArray(document)) return document.length > 0 ? document[0] : null 
        // Buscar si la clase hija definió toDTO
        return document || null
    }

    async findByFilter(filter){
        //Repository
        const document = await this.repository.findByFilter(filter)
        if(!document || document.length === 0) return null
        // Buscar si la clase hija definió toDTO
        return this.toDTO ? this.toDTO(document) : document
    }

    async findManyByFilter(filter){
        //Repository
        const document = await this.repository.findManyByFilter(filter)
        if(!document || document.length === 0) return []
        // Buscar si la clase hija definió toDTO
        return this.toManyDTO ? this.toManyDTO(document) : document
    }

    async findById(id){
        const document = await this.repository.findByID(id)
        if(!document || document.length === 0) return null
        // Buscar si la clase hija definió toDTO
        return this.toDTO ? this.toDTO(document) : document
    }

    //uso interno
    async findRawById(id){
        const document = await this.repository.findByID(id)
        if(!document || document.length === 0) return null
        // Buscar si la clase hija definió toDTO
        return document
    }

    async findPaginate(dftQuery, dftLimit, dftPage, dftSort){
        const documents = await this.repository.findPaginate(dftQuery, dftLimit, dftPage, dftSort)
        // Buscar si la clase hija definió toManyDTO y formatear los documentos
        const documentsFormated = this.toManyDTO ? this.toManyDTO(documents.docs) : documents.docs
        // Reemplazar los documentos originales por los formateados
        documents.docs = documentsFormated
        return documents
    }

    async findByQuery(opAgregations){
        const documentsGetted = await this.repository.findByQuery(opAgregations)
        if( !documentsGetted || documentsGetted.length === 0){
            return []
        }else{
            return this.toManyDTO?  this.toManyDTO(documentsGetted) : documentsGetted
        }
    }

    async create(document){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const documentCreated = await this.repository.create(this.toFormatDTO ? this.toFormatDTO(document) : document)

        //Si se produjo un error al crear el documento, lanzamos una excepción
        if (!documentCreated){ 
            throw new Error('Error al crear el documento')
        }
        // Buscar si la clase hija definió toDTO
        return this.toDTO ? this.toDTO(documentCreated) : documentCreated
    }

    async createMany(documents){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const documentsCreated = await this.repository.createMany(this.toFormatDTO ? documents.map(document => this.toFormatDTO(document)) : documents)

        //Si se produjo un error al crear los documentos, lanzamos una excepción
        if (!documentsCreated || documentsCreated.length === 0){ 
            throw new Error('Error al crear los documentos')
        }
        // Buscar si la clase hija definió toDTO
        return this.toManyDTO ? this.toManyDTO(documentsCreated) : documentsCreated
    }

    async update(id, updatedDocument){
        return await this.repository.update(id, updatedDocument)
    }

    async delete(id){
        return await this.repository.delete(id)
    }

    async deleteManyByFilter(filter){
        return await this.repository.deleteManyByFilter(filter)
    }
}

export default BaseService;