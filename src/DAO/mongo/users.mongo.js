import ServiceMongo from "../../service/dbMongoService.js";
const serviceMongo = new ServiceMongo();
//Modelo
import { User } from "./model/usersModel.js";

export default class UsersManager{

    constructor(){

    }

    getUsers(){
        return serviceMongo.getDocuments(User); 
    }

    getUserById(id){
        return serviceMongo.getDocumentByID(User, id);
    }
    getUserByFilter(filter){
        return serviceMongo.getDocumentByFilter(User, filter);
    }

    createUser(newUsuario){
        return serviceMongo.createDocument(User, newUsuario);
    }
    deleteUser(userID){
        return serviceMongo.deleteDocument(User, userID);
    }
    updateUser(userID,toUpdate){
        return serviceMongo.updateDocument(User, userID,toUpdate);
    }






}