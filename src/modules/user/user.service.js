//DTO
import { UserDTO } from "./user.dto.js";
import { DoctorsService } from "../doctor/index.js";
import { AppointmentsService } from "../appointment/index.js";
//Model
import { User } from "./user.model.js";
//Utils
import { createhash, normalizeText } from "../../utils/utils.js";
//Service
import BaseService from "../../core/services/base.service.js";
//Repository
import MongoRepository from "../../core/repositories/implementations/mongo.repository.js";
import { ConflictError, NotFoundError, ValidationError } from "../../core/exceptions/index.js";
import { searchRegex } from "../../shared/utils/regex.helper.js";
import { getRequestId } from "../../core/request-context/requestContext.js";
import { withTransaction } from "../../config/mongoDB.config.js";
import RedisRepository from "../../core/repositories/implementations/redis.repository.js";

const sessionRepository = new RedisRepository();

// Campos que se sincronizan con la ficha del doctor al editar un usuario doctor
const DOCTOR_FIELDS = ["name", "lastName", "email", "dni", "phone", "professionalLicense", "schedules", "color", "frequency"];

class UsersService extends BaseService{

    constructor() {
        const repository = new MongoRepository(User);
        super(repository);
    }

    /**
     * Retorna todos los usuarios formateados como DTO
     * @returns {Promise<Array>} Array de usuarios formateados como DTO
     */
    async findAll(){
        const users = await super.findAll({ active: true })
        return this.toManyDTO(users)
    }

    /**
     * Retorna todos los usuarios formateados como DTO
     * @param {String} email - Email del usuario a buscar
     * @returns {Promise<Object>} Usuario formateado como DTO
     */
    async findUserByEmail(email){
        const user = await this.repository.findByFilter({email: email})
        return user ? this.toDTO(user) : undefined
    }

    /**
     * Busca usuarios por filtro (status, rol) y retorna formateados como DTO
     * @param {Object} filter - Filtro de búsqueda (status, rol)
     * @returns {Promise<Array>} Array de usuarios formateados como DTO
     */
    async searchUsers({ status, rol}){
        const filter = { active: true };

        if (status) filter.status = status;
        if (rol) filter.rol = rol;
        
        const users = await this.repository.findManyByFilter(filter);

        return this.toManyDTO(users);
    }

    /**
     * Busca un usuario por ID y retorna formateado como DTO
     * @param {String} id - ID del usuario a buscar
     * @returns {Promise<Object>} Usuario formateado como DTO
     */
    async findById(id){
        const user = await super.findActiveById(id)
        if(!user) throw new NotFoundError("User", id);
        return this.toDTO(user)
    }

    /**
     * 
     * @param {String} search 
     * @param {String} rol 
     * @param {Number} limit 
     * @param {Number} page 
     * @param {Number} sort 
     * @returns {Promise<Object>} Objeto con usuarios paginados y formateados como DTO
     */
    async paginateUsers(search, rol, limit, page, sort){
        //Default query: {}
        let filter = {};
        if(search){
            const regex = searchRegex(search);
            filter = {
                $or: [
                    { name: regex },
                    { lastName: regex },
                    { email: regex }
                ]
            };
        }
        if(rol){
            filter.rol = rol;
        }
        filter.active = true;

        //Default sort: fecha de creación descendente
        const defaultSort = sort ? {lastName: parseInt(sort)} : {lastName: -1}
        const resultPaginate = await this.repository.findPaginate(filter, limit, page, defaultSort)
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    /**
     * Crea un usuario y opcionalmente su registro en la colección Doctor
     * @param {Object} newUser - Datos del nuevo usuario
     * @returns {Promise<Object>} Usuario creado
     */
    async create(newUser) {
    
        const isDoctor = String(newUser.rol || "").toLowerCase() === "doctor";

        //Boleano que indica si crear registro en colección Doctor
        let createDoctor;
        // Validar datos de Doctor si corresponde
        if (isDoctor) {
            createDoctor = this._validateDoctorData(newUser);
            if(!createDoctor) throw new ValidationError("Error al crear Usuario: Campos de doctor faltantes")
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

        // Sin ficha de doctor es un solo documento: la escritura ya es atómica
        if (!isDoctor) {
            const userAdded = await super.create(userFormated);
            return this.toDTO(userAdded);
        }

        const doctorService = new DoctorsService();

        // Usuario y ficha se guardan juntos: si la ficha falla (ej: dni o matrícula repetidos), tampoco queda el usuario
        const userAdded = await withTransaction(async (session) => {
            const user = await super.create(userFormated, { session });
            // El status del doctor es booleano (activo), distinto del status del usuario
            await doctorService.create({ ...newUser, id: user._id, status: true }, { session });
            return user;
        });

        return this.toDTO(userAdded);
    }

    /**
     * Actualiza un usuario y sincroniza con la colección Doctor si corresponde
     * @param {String} userID - ID del usuario
     * @param {Object} toUpdate - Datos a actualizar
     * @returns {Promise<Object>} Usuario actualizado
     */
    async update(userID, toUpdate) {
        
        //Obtener usuario actual. Uno dado de baja no se edita: da 404
        const prevUser = await super.findActiveById(userID);
        if (!prevUser) throw new NotFoundError("User", userID);

        //Determinar roles
        const prevRol = prevUser.rol ? normalizeText(prevUser.rol) : "";
        // Si no viene rol, se compara con el actual ya normalizado
        const newRol = toUpdate.rol ? normalizeText(toUpdate.rol) : prevRol;
        const isDoctor = prevUser.rol === "doctor" ;

        // No permitir cambio de rol
        if(prevRol !== newRol){
            throw new ValidationError("No se permite cambiar el rol del usuario");
        }

        // El rol solo se usa para la validación anterior: no se guarda
        const { rol, ...userFields } = toUpdate;

        // Si no es Doctor, solo se actualiza el usuario
        // active en el filtro de las escrituras: si se dio de baja después de leerlo, no se escribe
        if(!isDoctor) {
            const updatedUser = await this.repository.updateByFilter({ _id: userID, active: true }, userFields);
            if (!updatedUser) throw new NotFoundError("User", userID);
            return this.toDTO(updatedUser);
        }

        // Doctor: la actualización es parcial, solo se envían los campos que vinieron
        const doctorFields = Object.fromEntries(
            DOCTOR_FIELDS
                .filter(field => toUpdate[field] !== undefined)
                .map(field => [field, toUpdate[field]])
        );

        const doctorService = new DoctorsService();

        // Ficha y cuenta se actualizan juntas: si una falla (ej: dni, matrícula o email repetidos), no se guarda ninguna
        const updatedUser = await withTransaction(async (session) => {
            await doctorService.update(userID, doctorFields, { session });
            const user = await this.repository.updateByFilter({ _id: userID, active: true }, userFields, { session });
            if (!user) throw new NotFoundError("User", userID);
            return user;
        });

        return this.toDTO(updatedUser);
    }

    /**
     * Da de baja un usuario y su registro en Doctor (si corresponde) y cierra su sesión.
     * No se borran: quedan con active en false
     *
     * @param {String} userID - ID del usuario
     * @returns {Promise<Object>} Usuario dado de baja
     */
    async delete(userID) {
        // Usuario y ficha se dan de baja juntos: si falla la baja de la ficha, el usuario tampoco se da de baja
        const deletedUser = await withTransaction(async (session) => {
            // La baja devuelve el usuario: con su rol se sabe si tiene ficha, sin leerlo antes
            const user = await super.deactivate(userID, { session });
            if (!user) throw new NotFoundError("User", userID);

            if (user.rol === "doctor") {
                // Con turnos abiertos no se da de baja: se lanza el error y la transacción revierte la baja del usuario
                const appointmentsService = new AppointmentsService();
                if (await appointmentsService.hasOpenAppointments({ doctorID: userID }, { session })) {
                    throw new ConflictError("El profesional tiene turnos sin cerrar. Cancele, reasigne o marque como ausente sus turnos antes de darlo de baja");
                }
                const doctorService = new DoctorsService();
                await doctorService.delete(userID, { session });
            }
            return user;
        });

        // Después de guardar la baja: cierra la sesión en Redis, y su próxima request recibe 401
        await sessionRepository.delete(userID);

        return this.toDTO(deletedUser);
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Extrae los datos necesarios para crear un Doctor
     */
    _validateDoctorData(newUser) {
        const fields = ["dni", "phone", "professionalLicense", "frequency", "color"];

        const emptyField = [];

        fields.forEach(field => {
            if (!newUser[field]) {
                emptyField.push(field);
        }})

        if (emptyField.length > 0) {
            return false;
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