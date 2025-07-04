import PersistController from "../../DAO/persistController.js";
import { sendUserFormated, UserFormated, sendUsersFormated } from "../../dto/user.dto.js";
//Controlador de Persistencia
const persistController = new PersistController();
//Modelo
import { User } from "../../model/mongo/usersModel.js";

export default class UsersService{

    constructor(){

    }

    async getUsers(){
        //Se llama al Controlador de Persistencia
        const arrayUser = await persistController.getDocuments(User);
        return sendUsersFormated(arrayUser); 
    }

    //Devuelve el usuario buscado por identificador. Es el método utilizado por el controlador
    async getUserById(id){
        const userFounded = await persistController.getDocumentByID(User, id);
        if(userFounded)
            return sendUserFormated(userFounded);
        else{
            return false;
        }
    }

    //Devuelve el usuario completo
    async getAllUserById(id){
        const userFounded = await persistController.getDocumentByID(User, id);
        return userFounded ? userFounded : false;
    }

    async getUserPaginate(dQuery, dLimit, dPage, dSort){
        const usersGetted = await persistController.getDocumentsPaginate(User, dQuery, dLimit, dPage, dSort) 
        usersGetted && (usersGetted.docs = sendUsersFormated(usersGetted.docs))
        return usersGetted
         ? usersGetted
         : false
        
    }

    async getAllUserByFilter(filter){
        const userFounded = await persistController.getDocumentByFilter(User, filter);
        return userFounded ? userFounded : false;
    }

    //Devuelve un usuario formateado buscado por atributo no por clave usuario
    async getUserByFilter(filter){
        const userFounded = await persistController.getDocumentByFilter(User, filter);
        return userFounded ? sendUserFormated(userFounded) : false;
    }

    //Persiste un usuario completo en la DB
    async createUser(newUsuario){
        const newUserFormated =  new UserFormated(newUsuario);
        const userAdded = await persistController.createDocument(User, newUserFormated)
        if(userAdded.status){
            //Retorna un usuario Formateado 
            return {...userAdded, dt: sendUserFormated(userAdded.dt)};
        }
        else{
            //En caso de producirse un error al persistir el usuario. Se retorna false
            return userAdded
        }
    }

    deleteUser(userID){
        return persistController.deleteDocument(User, userID);
    }
    updateUser(userID,toUpdate){
        return persistController.updateDocument(User, userID,toUpdate);
    }
}