import ServiceMongo from "../../service/dbMongoService.js";
import { sendUserFormated, UserFormated, sendUsersFormated } from "../DTO/user.dto.js";
//Controlador de Persistencia
const serviceMongo = new ServiceMongo();
//Modelo
import { User } from "./model/usersModel.js";

export default class UsersManager{

    constructor(){

    }

    async getUsers(){
        //Se llama al Controlador de Persistencia
        const arrayUser = await serviceMongo.getDocuments(User);
        return sendUsersFormated(arrayUser); 
    }

    //Devuelve el usuario buscado por identificador. Es el método utilizado por el controlador
    async getUserById(id){
        const userFounded = await serviceMongo.getDocumentByID(User, id);
        if(userFounded)
            return sendUserFormated(userFounded);
        else{
            return false;
        }
    }

    //Devuelve el usuario completo
    async getAllUserById(id){
        const userFounded = await serviceMongo.getDocumentByID(User, id);
        return userFounded ? userFounded : false;
    }

    async getUserPaginate(dQuery, dLimit, dPage, dSort){
        const usersGetted = await serviceMongo.getDocumentsPaginate(User, dQuery, dLimit, dPage, dSort) 
        usersGetted && (usersGetted.docs = sendUsersFormated(usersGetted.docs))
        //console.log(usersGetted)
        return usersGetted
         ? usersGetted
         : false
        
    }

    async getAllUserByFilter(filter){
        const userFounded = await serviceMongo.getDocumentByFilter(User, filter);
        return userFounded ? userFounded : false;
    }

    //Devuelve un usuario formateado buscado por atributo no por clave usuario
    async getUserByFilter(filter){
        const userFounded = await serviceMongo.getDocumentByFilter(User, filter);
        return userFounded ? sendUserFormated(userFounded) : false;
    }

    //Persiste un usuario completo en la DB
    async createUser(newUsuario){
        const newUserFormated =  new UserFormated(newUsuario);
        const userAdded = await serviceMongo.createDocument(User, newUserFormated)
        if(userAdded){
            //Retorna un usuario Formateado 
            return newUserFormated.sendUser();
        }
        else{
            //En caso de producirse un error al persistir el usuario. Se retorna false
            return false
        }
    }

    deleteUser(userID){
        return serviceMongo.deleteDocument(User, userID);
    }
    updateUser(userID,toUpdate){
        return serviceMongo.updateDocument(User, userID,toUpdate);
    }






}