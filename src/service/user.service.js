//DTO
import { UserDTO } from "../dto/user.dto.js";
import { DoctorDTO } from "../dto/doctor.dto.js";
//Model
import { User } from "../model/mongo/user.model.js";
//Utils
import { createhash, normalizeText } from "../utils/utils.js";
//Service
import BaseService from "./base.service.js";
import DoctorService from "./doctor.service.js";
//Repository
import MongoRepository from "../repositories/implementations/mongo.repository.js";
import { NotFoundError, ValidationError } from "../exceptions/validations.exception.js";

class UsersService extends BaseService{

    constructor() {
        const repository = new MongoRepository(User);
        super(repository);
    }

    async findAll(){
        const users = await super.findAll()
        return this.toManyDTO(users)
    }

    //Bucar usuario por email
    async findUserByEmail(email){
        const user = await this.repository.findByFilter({email: email})
        return user ? this.toDTO(user) : undefined
    }

    //Buscar usuarios por estado y rol
    async searchUsers({ status, rol}){
        const filter = {};
        
        if (status) filter.status = status;
        if (rol) filter.rol = rol;
        
        const users = await this.repository.findManyByFilter(filter);

        return this.toManyDTO(users);
    }

    async findById(id){
        const user = await super.findById(id)
        if(!user) throw new NotFoundError("User", id);
        return this.toDTO(user)
    }

    async paginateUsers(search, rol, limit, page, sort){
        //Default query: {}
        let filter = {};
        if(search){
            const regex = new RegExp(search, "i");
            filter = {
                $or: [
                    { name: regex },
                    { lastName: regex },
                    { email: regex },
                    { DNI: regex }
                ]
            };
        }
        if(rol){
            filter.rol = rol;
        }

        //Default sort: fecha de creación descendente
        const defaultSort = sort ? {lastName: parseInt(sort)} : {lastName: -1}
        const resultPaginate = await this.repository.findPaginate(filter, limit, page, defaultSort)
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    /**
     * Crea un usuario y opcionalmente su registro en la colección Doctor
     * @param {Object} newUser - Datos del nuevo usuario
     * @param {Object} userSession - Usuario autenticado (req.user)
     * @returns {Object} { status, dt?, error? }
     */
    async create(newUser) {
    
        const isDoctor = String(newUser.rol || "").toLowerCase() === "doctor";

        //Boleano que indica si crear registro en colección Doctor
        let createDoctor;
        // Validar datos de Doctor si corresponde
        if (isDoctor) {
            createDoctor = this._validateDoctorData(newUser);
        }

        //Encriptar la contraseña, definir status y formatear datos del usuario
        const securePassword = createhash(newUser.password);
        //Contraseña
        newUser.password = securePassword;
        //Para que el usuario cambie la contraseña puesta por el administrador
        newUser.mustChangePassword = true;
        //Hisotrial de Contraseña
        const arrayPass = [];
        arrayPass.push(securePassword)
        newUser.passwordHistory = arrayPass;
        //Estado del usuario
        newUser.status = 'active';
        //DTO de dominio
        const userFormated = new UserDTO(newUser);

        //Crear el usuario principal
        const userAdded = await super.create(userFormated);

        // Crear registro Doctor, si es necesario
        if (isDoctor && createDoctor) {
            //Asignar el ID del usuario creado al doctor para relacion
            const newDoctor = {...newUser};
            newDoctor.id = userAdded._id;
            newDoctor.status = 'active';
            const formatedDoctor  =  new DoctorDTO(newDoctor);
            const doctorService = new DoctorService();
            const doctorAdded = await doctorService.create(formatedDoctor); 
            if (!doctorAdded) {
                //Borrar usuario creado
                await super.delete(userAdded._id);
                throw new Error("Error al crear el Doctor");
            }
        }
        
        //Éxito
        return this.toDTO(userAdded);
    }

    /**
     * Actualiza un usuario y sincroniza con la colección Doctor si corresponde
     * @param {String} userID - ID del usuario
     * @param {Object} toUpdate - Datos a actualizar
     * @param {Object} userSession - Usuario autenticado (req.user)
     * @returns {Object|false} Usuario actualizado o false
     */
    async update(userID, toUpdate, userSession) {
        
        //Obtener usuario actual
        const prevUser = await super.findById(userID);
        if (!prevUser) throw new NotFoundError("User", id);

        //Determinar roles
        const newRol = toUpdate.rol ? normalizeText(toUpdate.rol) : prevUser.rol;
        const prevRol = prevUser.rol ? normalizeText(prevUser.rol) : "";
        const isDoctor = prevUser.rol === "doctor" ;

        // No permitir cambio de rol
        if(prevRol !== newRol){
            throw new ValidationError("No se permite cambiar el rol del usuario");
        }

        //Actualizar usuario principal
        const updatedUser = await super.update(
            userID,
            toUpdate
        );

        if (!updatedUser) throw new Error("Error al actualizar el usuario");

        if(isDoctor){
            let updatedFields = {};
            if(toUpdate.name) updatedFields.name = toUpdate.name;
            if(toUpdate.lastName) updatedFields.lastName = toUpdate.lastName;
            if(toUpdate.email) updatedFields.email = toUpdate.email;
            if(toUpdate.dni) updatedFields.dni = toUpdate.dni;
            if(toUpdate.phone) updatedFields.phone = toUpdate.phone;
            if(toUpdate.professionalLicense) updatedFields.professionalLicense = toUpdate.professionalLicense;
            if(toUpdate.color) updatedFields.color = toUpdate.color;
            if(toUpdate.schedules) updatedFields.schedules = toUpdate.schedules;
            const updatedDoctor = new DoctorDTO(updatedFields);
            const doctorService = new DoctorService();
            await doctorService.update(userID, updatedDoctor);
        }
        
        return updatedUser;
    }

    /**
     * Elimina un usuario y su registro en Doctor (si corresponde)
     * @param {String} userID - ID del usuario
     * @param {Object} userSession - Usuario autenticado (req.user)
     * @returns {Object|false} Usuario eliminado formateado o false
     */
    async delete(userID) {
        //Obtener usuario antes de eliminarlo
        const user = await super.findById(userID);
        if (!user) throw new NotFoundError("User", id);

        //Si es Doctor, eliminar de la colección Doctor
        const isDoctor = String(user.rol || "").toLowerCase() === "doctor";
        if (isDoctor) {
            const doctorService = new DoctorService();
            await doctorService.delete(userID)
        }

        //Eliminar usuario
        await super.delete(userID);

        return this.toDTO(user);
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Extrae los datos necesarios para crear un Doctor
     */
    _validateDoctorData(newUser) {
        const fields = ["dni", "phone", "professionalLicense"];

        const emptyField = [];

        fields.forEach(field => {
            if (!newUser[field]) {
                emptyField.push(field);
            }})

        if (emptyField.length > 0) {
            throw new Error(`Faltan campos de Doctor: ${emptyField.join(", ")}`);
        }
        //Retorna 'true' si todo los campos están presentes
        return true;
    }
    
    //Métodos de mapeo DTO
    toFormatDTO(userData) {
        return new UserDTO(userData)
    }

    toDTO(user) {
        return UserDTO.toResponse(user)
    }

    toManyDTO(users) {
        return users.map(user => UserDTO.toResponse(user));
    }

}

export default UsersService;