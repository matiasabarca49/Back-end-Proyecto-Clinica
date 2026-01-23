// service/mongo/user.service.js
/* import PersistController from "../../DAO/persistController.js"; */
import { sendUserFormated, UserFormated, sendUsersFormated, UserDTO } from "../dto/user.dto.js";
import { DoctorFormated } from "../dto/doctor.dto.js";
import { User } from "../model/mongo/user.model.js";
import { Doctor } from "../model/mongo/doctor.model.js";
import { createhash, normalizeText } from "../utils/utils.js";
import BaseService from "./base.service.js";
import DoctorService from "./mongo/doctor.service.js";
import MongoRepository from "../repositories/implementations/mongo.repository.js";

class UsersService extends BaseService{

    constructor() {
        const repository = new MongoRepository(User);
        super(repository);
    }

    async findAll(){
        const users = await super.findAll()
        if(!users) throw new Error('Error interno del servidor')
        return this.toManyDTO(users)
    }

    async findByFilter(filter){
        //Repository
        const user = await super.findByFilter(filter)
        return user ? this.toDTO(user) : undefined
        
    }

    async findManyByFilter(filter){
        const users = await super.findManyByFilter(filter) 
        return this.toManyDTO(users)
    }

    async findByFilterOrFail(filter){
        const user =  await super.findByFilter(filter)
        if(!user) throw new Error('Usuario no encontrado')
        return this.toDTO(user)
    }

    async findById(id){
        const user = await super.findById(id)
        if(!user) throw new Error('Usuario no encontrado')
        return this.toDTO(user)
    }

    async findPaginate(dftQuery, dftLimit, dftPage, dftSort){
        const resultPaginate = await super.findPaginate(dftQuery, dftLimit, dftPage, dftSort)
        resultPaginate.docs = this.toManyDTO(resultPaginate.docs)
        return resultPaginate
    }

    async findByQuery(opAgregations){
        const users = await super.findByQuery(opAgregations) 
        return this.toManyDTO(users) 
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
        newUser.password = createhash(newUser.password);
        newUser.status = 'ACTIVE';
        //DTO de dominio
        const userFormated = new UserDTO(newUser);

        //Crear el usuario principal
        const userAdded = await super.create(userFormated);

        // Crear registro Doctor, si es necesario
        if (isDoctor && createDoctor) {
            //Asignar el ID del usuario creado al doctor para relacion
            newUser.id = userAdded._id;
            const formatedDoctor  =  new DoctorFormated(newUser);
            const doctorService = new DoctorService();
            const doctorAdded = await doctorService.createDoctor(formatedDoctor); //->> Cambiar con nuevo servicio =======
            if (!doctorAdded) {
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
    async updateUser(userID, toUpdate, userSession) {
        
        //Obtener usuario actual
        const prevUser = await super.findById(userID);
        if (!prevUser) return false;

        //Determinar roles
        const newRol = toUpdate.rol ? normalizeText(toUpdate.rol) : prevUser.rol;
        const wasDoctor = String(prevUser.rol || "").toLowerCase() === "doctor";
        const willBeDoctor = String(newRol || "").toLowerCase() === "doctor";

        //Actualizar usuario principal
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            toUpdate,
            { new: true, runValidators: true }
        );

        if (!updatedUser) throw new Error("Error al actualizar el usuario");

        // 4️⃣ Gestionar cambios en la colección Doctor
        await this._handleDoctorCollectionOnUpdate(
            prevUser,
            updatedUser,
            wasDoctor,
            willBeDoctor,
            toUpdate
        );

        return updatedUser;
    }

    /**
     * Elimina un usuario y su registro en Doctor (si corresponde)
     * @param {String} userID - ID del usuario
     * @param {Object} userSession - Usuario autenticado (req.user)
     * @returns {Object|false} Usuario eliminado formateado o false
     */
    async deleteUser(userID) {
        //Obtener usuario antes de eliminarlo
        const user = await super.findById(userID);
        if (!user) throw new Error("Usuario no encontrado");

        //Si es Doctor, eliminar de la colección Doctor
        const isDoctor = String(user.rol || "").toLowerCase() === "doctor";
        if (isDoctor) {
            const doctorService = new DoctorService();
            await doctorService.deleteDoctor(userID) // CAMBIAR CON NUEVO SERVICIO =======
        }

        // 3️⃣ Eliminar usuario
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
    
    /**
     * Gestiona la sincronización con la colección Doctor al actualizar un usuario
     */
    async _handleDoctorCollectionOnUpdate(prevUser, updatedUser, wasDoctor, willBeDoctor, toUpdate) {
        // Caso 1: Sigue siendo Doctor → Sincronizar datos
        if (wasDoctor && willBeDoctor) {
            const doctorUpdate = {};
            if (toUpdate.name) doctorUpdate.name = toUpdate.name;
            if (toUpdate.lastName) doctorUpdate.lastName = toUpdate.lastName;
            if (toUpdate.email) doctorUpdate.email = toUpdate.email;

            if (Object.keys(doctorUpdate).length) {
                await Doctor.updateOne(
                    { email: prevUser.email },
                    { $set: doctorUpdate }
                ).catch(err => console.error("[Sync Doctor] Error:", err));
            }
        }

        // Caso 2: Promoción a Doctor → Crear registro
        if (!wasDoctor && willBeDoctor) {
            const df = (toUpdate?.doctorFields && typeof toUpdate.doctorFields === "object")
                ? toUpdate.doctorFields
                : toUpdate;

            const validation = this._validateDoctorFields(df);
            if (!validation.valid) {
                throw new Error(validation.message);
            }

            await Doctor.create({
                name: updatedUser.name,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                dni: df.dni,
                phone: df.phone,
                professionalLicense: df.professionalLicense
            }).catch(err => {
                console.error("[Create Doctor] Error:", err);
                throw err;
            });
        }

        // Caso 3: Degradación de Doctor → Eliminar registro
        if (wasDoctor && !willBeDoctor) {
            await this._safeDeleteDoctor(prevUser.email);
        }
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