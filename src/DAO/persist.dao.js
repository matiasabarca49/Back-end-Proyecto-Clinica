export default class PersistController{

    constructor(model){
        this.model = model
    };

    async getDocuments(){
        return await this.model.find()
            .catch(error => { 
                console.log(error);
                throw error
            })  
    }

    async getDocumentsByFilter(filter){
        return await this.model.find(filter)
            .catch(error => { 
                console.log(error);
                throw error
            }) 
    }

    async getDocumentByID(id){
        return await this.model.findOne({_id: id})
            .catch(error => {
                console.log(error);
                throw error
            })
    }

    async getDocumentByFilter(filter){
       return  await this.model.findOne(filter)
            .catch(error => {
                console.log(error);
                throw error
                }
            )
    }

    //Traer documentos con una query. Con paginación
    async getDocumentByQuery(filter, limit, page, sort){
        return await this.model.paginate(filter, {limit: limit || 10, page: page || 1, sort: sort || {} })
            .catch( error => {
                console.log(error);
                throw error
            })
    }

    // Similar a getDocumentByQuery pero sin paginación
    async getAllDocumentByQuery(filter){
        return await this.model.find(filter)
            .catch ( error => {
                console.log(error);
                throw error
            })
    }

    async getDocumentsPaginate(dQuery, dLimit, dPage, dSort, idUser = false){
        return await this.model.paginate(idUser ? {...dQuery, idDoctor: idUser} : dQuery || {}, {limit: dLimit || 5, page: dPage || 1, sort: dSort || {} })
        .catch( error =>{
            console.log(error)
            throw error
            }
        )
    }

    async createDocument(data){
        return await this.model.create(data)
        .catch(error =>{ 
            console.log(error);
            throw error
        })
    }

    async deleteDocument(id){
        return await this.model.deleteOne( {_id:id})
        .catch(error =>{ 
            console.log(error)
            throw error
        })
    }

    async updateDocument(idDocumento,toUpdate){
        return await this.model.updateOne( {_id:idDocumento},toUpdate)
        .catch(error =>{ 
            console.log(error)
            throw error
        })
    }
}