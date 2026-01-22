// service/mongo/user.service.js
/* import PersistController from "../../DAO/persistController.js"; */
import { sendUserFormated, UserFormated, sendUsersFormated, UserDTO } from "../dto/user.dto.js";
import { User } from "../model/mongo/user.model.js";
import { Doctor } from "../model/mongo/doctor.model.js";
import { normalizeText } from "../utils/utils.js";
import BaseService from "./base.service.js";
import DoctorService from "./mongo/doctor.service.js";
import MongoRepository from "../repositories/implementations/mongo.repository.js";

class UsersService extends BaseService{

    constructor() {
        const repository = new MongoRepository(User);
        super(repository);
    }

    /* async getUsers() {
        const arrayUser = await persistController.getDocuments(User);
        return sendUsersFormated(arrayUser);
    }

    async getUserById(id) {
        const userFounded = await persistController.getDocumentByID(User, id);
        if (userFounded) return sendUserFormated(userFounded);
        else return false;
    } */

    /* async getAllUserById(id) {
        const userFounded = await persistController.getDocumentByID(User, id);
        return userFounded ? userFounded : false;
    } */

    /* async getUserPaginate(dQuery, dLimit, dPage, dSort) {
        const usersGetted = await persistController.getDocumentsPaginate(User, dQuery, dLimit, dPage, dSort);
        usersGetted && (usersGetted.docs = sendUsersFormated(usersGetted.docs));
        return usersGetted ? usersGetted : false;
    } */

    /* async getManyUsersByFilter(filter) {
        const usersFounded = await persistController.getDocumentsByFilter(User, filter);
        return usersFounded ? sendUsersFormated(usersFounded) : false;
    }

    async getAllUserByFilter(filter) {
        const userFounded = await persistController.getDocumentByFilter(User, filter);
        return userFounded ? userFounded : false;
    } */

   /*  async getUserByFilter(filter) {
        const userFounded = await persistController.getDocumentByFilter(User, filter);
        return userFounded ? sendUserFormated(userFounded) : false;
    }
 */

    /**
     * Crea un usuario y opcionalmente su registro en la colección Doctor
     * @param {Object} newUser - Datos del nuevo usuario
     * @param {Object} userSession - Usuario autenticado (req.user)
     * @returns {Object} { status, dt?, error? }
     */
    async createUser(newUser, userSession) {
    
        // Normalizar datos
        const userNormalized = {
            ...newUser,
            name: normalizeText(newUser.name),
            lastName: normalizeText(newUser.lastName),
            rol: normalizeText(newUser.rol)
        };

        const newUserFormated = new UserDTO(userNormalized);

        //Crear el usuario principal
        const userAdded = await this.repository.create(newUserFormated);
        /* if (!userAdded.status) {
            return userAdded; // Devuelve el error (incluye code 11000)
        } */

        //Si es Doctor, crear registro en colección Doctor
        const isDoctor = String(userNormalized.rol || "").toLowerCase() === "doctor";
        if (isDoctor) {
            const doctorData = this._extractDoctorData(newUser, userAdded);
            
            // Validar campos requeridos
            const validation = this._validateDoctorFields(doctorData);
            if (!validation.valid) {
                // Compensación: eliminar el usuario creado
                await this._safeDeleteUser(userAdded._id);
                throw new Error(validation.message);
            }

            // Crear registro Doctor
            const doctorService = new DoctorService();
            const doctorAdded = await doctorService.createDoctor(doctorData); //->> Cambiar con nuevo servicio =======
            /* if (!doctorAdded.status) {
                // Compensación: eliminar el usuario creado
                await this._safeDeleteUser(userAdded._id);
                return doctorAdded;
            } */
        }

        // 3️⃣ Éxito
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
        const prevUser = await this.findRawById(userID);
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
    async deleteUser(userID, userSession) {
        //Obtener usuario antes de eliminarlo
        const user = await this.findRawById(userID);
        if (!user) throw new Error("Usuario no encontrado");

        //Si es Doctor, eliminar de la colección Doctor
        const isDoctor = String(user.rol || "").toLowerCase() === "doctor";
        if (isDoctor) {
            await this._safeDeleteDoctor(user.email);
        }

        // 3️⃣ Eliminar usuario
        await User.deleteOne({ _id: userID });

        return this.toDTO(user);
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Extrae los datos necesarios para crear un Doctor
     */
    _extractDoctorData(newUser, userDoc) {
        const df = (newUser?.doctorFields && typeof newUser.doctorFields === "object")
            ? newUser.doctorFields
            : newUser;

        return {
            name: userDoc.name,
            lastName: userDoc.lastName,
            email: userDoc.email,
            dni: df?.dni,
            phone: df?.phone,
            professionalLicense: df?.professionalLicense
        };
    }

    /**
     * Valida que los campos requeridos de Doctor estén presentes
     */
    _validateDoctorFields(doctorData) {
        const requiredFields = ["dni", "phone", "professionalLicense"];
        const missing = requiredFields.filter(field => !doctorData[field]);

        if (missing.length) {
            return {
                valid: false,
                message: `Faltan campos de Doctor: ${missing.join(", ")}`
            };
        }

        return { valid: true };
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

    /**
     * Elimina un usuario de forma segura (ignora errores)
     */
    async _safeDeleteUser(userID) {
        try {
            await User.deleteOne({ _id: userID });
        } catch (error) {
            console.error("[_safeDeleteUser] Error:", error);
        }
    }

    /**
     * Elimina un Doctor de forma segura (ignora errores)
     */
    async _safeDeleteDoctor(email) {
        try {
            await Doctor.deleteOne({ email });
        } catch (error) {
            console.error("[_safeDeleteDoctor] Error:", error);
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