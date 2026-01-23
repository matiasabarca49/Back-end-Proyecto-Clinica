class BaseService{

    constructor(repository) {  
        //DIP
        this.repository = repository
    }

    async findAll(){
        //Llama al Repository
        return await this.repository.findAll()
    }


    async findByFilter(filter){
        //Repository
        return await this.repository.findByFilter(filter)
        
    }

    async findManyByFilter(filter){
        return await this.repository.findManyByFilter(filter) 
    }

    async findById(id){
        return await this.repository.findByID(id)
    }

    async findPaginate(dftQuery, dftLimit, dftPage, dftSort){
        return await this.repository.findPaginate(dftQuery, dftLimit, dftPage, dftSort)
    }

    async findByQuery(opAgregations){
        return await this.repository.findByQuery(opAgregations) 
    }

    async create(document){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const documentCreated = await this.repository.create(document)

        //Si se produjo un error al crear el documento, lanzamos una excepción
        if (!documentCreated){ 
            throw new Error('Error al crear el documento');
        }
        return documentCreated;
    }

    async createMany(documents){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const documentsCreated = await this.repository.createMany(documents)

        //Si se produjo un error al crear los documentos, lanzamos una excepción
        if (!documentsCreated || documentsCreated.length === 0){ 
            throw new Error('Error al crear los documentos')
        }
        // Buscar si la clase hija definió toDTO
        return documentsCreated
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