import { getRedisClient } from "../config/redis.config.js";
import { CreateUserRequestDTO } from "../dto/user.dto.js";
import UsersService from "../service/user.service.js";
const usersService = new UsersService();

/**
 * Retorna todos los usuarios
 */
export const getUsers = async (req, res) => {
    try {
        const {search, rol, sort, page, limit } = req.query;
        let usersGetted;
        if(!page && !limit){
            usersGetted = await usersService.findAll();
        }else{
            usersGetted = await usersService.paginateUsers(search, rol, limit, page, sort);
        }
        usersGetted
            ? res.status(200).send({ status: "Success", users: usersGetted })
            : res.status(500).send({ status: "ERROR" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Retorna múltiples usuarios por filtro status o rol
 */
export const searchUsers = async (req, res) => {
    try {
        const { status, rol } = req.query;
        if(!status && !rol ) throw new Error("Query necesarias [status, role] ")

        const usersGetted = await usersService.searchUsers({ status, rol});
        usersGetted
            ? res.status(200).send({ status: "Success", users: usersGetted })
            : res.status(400).send({ status: "ERROR" });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: "ERROR", reason: error.message || "Error en el servidor, intentar más tarde" });
    }
};

/**
 * Retorna un usuario por ID
 */
export const getUserByID = async (req, res) => {
    try {
        const userID = req.params.id;
        const userGetted = await usersService.findById(userID);
        userGetted
            ? res.status(200).send({ status: "Success", user: userGetted })
            : res.status(404).send({ status: "ERROR", message: "No se encontró el usuario con ID proporcionado" });
    } catch (error) {
        return res.status(500).send({ status: "ERROR", message: error.message });
    }
};


/**
 * Crea un nuevo usuario
 * Si el rol es "Doctor", valida campos adicionales y crea registro en colección Doctor
 */
export const createUser = async (req, res) => {
    try {
        //DTO de Request
        const user = new CreateUserRequestDTO(req.body);
        
        // Llamar al service
        const userCreated = await usersService.create(user);
        
        // Éxito
        return res.status(201).send({
            status: "Success",
            user: userCreated
        });

    } catch (error) {
        console.error("[createUser] Error:", error);
        return res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Actualiza un usuario existente
 * Sincroniza cambios con la colección Doctor si corresponde
 */
export const updateUser = async (req, res) => {
    try {
        const userData = req.body;
        const userID = req.params.id;
        const userSession = req.user;

        // Validación: Si promociona a Doctor, validar campos requeridos
        if (userData.rol && String(userData.rol).toLowerCase() === "doctor") {
            const df = (userData?.doctorFields && typeof userData.doctorFields === "object")
                ? userData.doctorFields
                : userData;

            const missingFields = ["dni", "phone", "professionalLicense"]
                .filter(field => !df?.[field]);

            if (missingFields.length) {
                // Obtener el usuario actual para verificar si ya era Doctor
                const currentUser = await usersService.findById(userID);
                const wasDoctor = currentUser && String(currentUser.rol).toLowerCase() === "doctor";

                // Solo validar si NO era Doctor antes (promoción)
                if (!wasDoctor) {
                    return res.status(400).send({
                        status: "ERROR",
                        message: `Para promocionar a Doctor se requieren: ${missingFields.join(", ")}`
                    });
                }
            }
        }

        // Llamar al service
        const userUpdated = await usersService.update(userID, userData, userSession);

        // Manejo de respuestas
        if (!userUpdated) {
            return res.status(404).send({
                status: "ERROR",
                message: "Usuario no encontrado"
            });
        }

        // Si el service devuelve un objeto con status:false (error de duplicado)
        if (userUpdated.status === false && userUpdated.error?.code === 11000) {
            return res.status(409).send({
                status: "ERROR",
                message: "El email ya existe"
            });
        }

        // Éxito
        return res.status(200).send({
            status: "Success",
            user: userUpdated
        });

    } catch (error) {
        console.error("[updateUser] Error:", error);
        return res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Elimina un usuario
 * También elimina su registro en la colección Doctor si corresponde
 */
export const deleteUser = async (req, res) => {
    try {
        const userID = req.params.id;
        const userSession = req.user;

        //Verificando que el usuario a eliminar no tenga una sesión activa
        const redisClient = await getRedisClient()
        const isActive = await redisClient.get(`session:${userID}`)

        if(isActive){
            console.log(`El usuario ${userID} no se puede eliminar porque tiene una sesión activa`)
            return res.status(403).send({ status: "ERROR", message: "El usuario tiene una sesión activa" });
        } 

        const userDeleted = await usersService.delete(userID);

        userDeleted
            ? res.status(200).send({ status: "Success", user: userDeleted })
            : res.status(404).send({ status: "ERROR", message: "Usuario no encontrado" });

    } catch (error) {
        console.error("[deleteUser] Error:", error);
        return res.status(500).send({ status: "ERROR", message: error.message });
    }
};