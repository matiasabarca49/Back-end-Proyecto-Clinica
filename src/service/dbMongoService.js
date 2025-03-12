export default class ServiceMongo{

    constructor(){};

    async getDocuments(Model){
        let documentsFromDB;
        await Model.find()
            .then( dt => {
                documentsFromDB = dt;
            })
            .catch(error => { 
                console.log(error);
                documentsFromDB = false;
            })
        return documentsFromDB;   
    }

    async getDocumentByID(Model, id){
        let documentFromDB;
        await Model.findOne({_id: id})
            .then( dt => {
                documentFromDB = dt;
            })
            .catch(error => {
                console.log(error);
                documentFromDB = false;
            })
        
        return documentFromDB;
    }

    async getDocumentByFilter(Model, filter){
        let documentFromDB;
        await Model.findOne(filter)
            .then( dt => {
                documentFromDB = dt;
            })
            .catch(error => {
                console.log(error);
                documentFromDB = false;
                }
            )
        return documentFromDB;
    }

    async getDocumentsPaginate(Model, dQuery, dLimit, dPage, dSort){
        let documents;
        await Model.paginate(dQuery || {}, {limit: dLimit || 5, page: dPage || 1, sort: dSort || {} })
        .then( dts =>{
            documents = dts;
        })
        .catch( error =>{
            console.log(error)
            documents = false;
            ;
            }
        )
        return documents;
    }

    async createDocument(Model, data){
        let userDT

        await Model.create(data)
        .then( dt => {
            userDT = dt;
            })
        .catch(error =>{ 
            console.log(error);
            userDT = false;
        })
        return userDT
    }

    async deleteDocument(Model, id){
        let userDT

        await Model.deleteOne( {_id:id})
        .then( dt => {
            //console.log(dt);
            userDT = dt;
            })
        .catch(error =>{ 
            console.log(error)
            return false
        })
        return userDT
    }
    async updateDocument(Model,idDocumento,toUpdate){
        let userDT
    
        await Model.updateOne( {_id:idDocumento},toUpdate)
        .then( dt => {
            //console.log(dt);
            userDT = dt;
            })
        .catch(error =>{ 
            console.log(error)
            return false
        })
        return userDT
    }
}