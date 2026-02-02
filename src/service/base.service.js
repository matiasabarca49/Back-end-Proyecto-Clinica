class BaseService{

    constructor(repository) {  
        //DIP
        this.repository = repository
    }

    async findAll(){
        //Llama al Repository
        return await this.repository.findAll()
    }

    
    async findById(id){
        if(!id) throw new Error("Se debe proporcionar un ID")
        return await this.repository.findByID(id)
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
        if(!id) throw new Error("Se debe proporcionar un ID")
        return await this.repository.update(id, updatedDocument)
    }

    async delete(id){
        if(!id) throw new Error("Se debe proporcionar un ID")
        return await this.repository.delete(id)
    }

}

export default BaseService;