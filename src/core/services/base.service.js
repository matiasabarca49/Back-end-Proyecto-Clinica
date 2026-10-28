class BaseService{

    constructor(repository) {  
        //DIP
        this.repository = repository
    }

    // `options` se pasa tal cual al repository: dentro de una transacción es { session }

    async findAll(filters = {}, options = {}){
        //Llama al Repository
        return await this.repository.findAll(filters, options)
    }

    
    async findById(id, options = {}){
        if(!id) throw new Error("Se debe proporcionar un ID")
        return await this.repository.findByID(id, options)
    }

    // Igual que findById, pero un documento dado de baja (active en false) se trata como inexistente: devuelve null.
    // Solo para colecciones con soft delete (campo active): en las demás nunca encuentra nada
    async findActiveById(id, options = {}){
        if(!id) throw new Error("Se debe proporcionar un ID")
        return await this.repository.findByFilter({ _id: id, active: true }, options)
    }

 
    async create(document, options = {}){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const documentCreated = await this.repository.create(document, options)

        //Si se produjo un error al crear el documento, lanzamos una excepción
        if (!documentCreated){ 
            throw new Error('Error al crear el documento');
        }
        return documentCreated;
    }

    async createMany(documents, options = {}){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const documentsCreated = await this.repository.createMany(documents, options)

        //Si se produjo un error al crear los documentos, lanzamos una excepción
        if (!documentsCreated || documentsCreated.length === 0){ 
            throw new Error('Error al crear los documentos')
        }
        // Buscar si la clase hija definió toDTO
        return documentsCreated
    }

    async update(id, updatedDocument, options = {}){
        if(!id) throw new Error("Se debe proporcionar un ID")
        return await this.repository.update(id, updatedDocument, options)
    }

    async delete(id, options = {}){
        if(!id) throw new Error("Se debe proporcionar un ID")
        return await this.repository.delete(id, options)
    }

    // Soft delete: marca el documento como inactivo en vez de borrarlo, para no romper sus referencias.
    // Devuelve el documento actualizado, o null si no existe o ya estaba inactivo.
    // Solo para colecciones con soft delete (campo active): en las demás siempre devuelve null
    async deactivate(id, options = {}){
        if(!id) throw new Error("Se debe proporcionar un ID")
        return await this.repository.updateByFilter({ _id: id, active: true }, { active: false }, options)
    }

}

export default BaseService;