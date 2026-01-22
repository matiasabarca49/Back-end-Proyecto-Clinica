import { getRedisClient } from "../config/redis.config.js";
import UsersService from "../service/user.service.js";
const usersService = new UsersService();

/**
 * Retorna todos los usuarios
 */
export const getUsers = async (req, res) => {
    try {
        const usersGetted = await usersService.findAll();
        usersGetted
            ? res.status(200).send({ status: "Success", users: usersGetted })
            : res.status(500).send({ status: "ERROR" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Retorna múltiples usuarios por filtro
 */
export const getManyUsersByFilter = async (req, res) => {
    try {
        const filter = req.query;
        const usersGetted = await usersService.findManyByFilter(filter);
        usersGetted
            ? res.status(200).send({ status: "Success", users: usersGetted })
            : res.status(400).send({ status: "ERROR" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "ERROR", reason: "Error en el servidor, intentar más tarde" });
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
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Retorna un usuario por filtro
 */
export const getUserByFilter = async (req, res) => {
    try {
        const filter = req.query;
        const userGetted = await usersService.findByFilter(filter);
        userGetted
            ? res.status(200).send({ status: "Success", users: userGetted })
            : res.status(400).send({ status: "ERROR", message: "No se encontró el usuario" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Retorna usuarios con paginación
 */
export const getsUsersPaginate = async (req, res) => {
    try {
        let defaultQuery, defaultLimit, defaultPage, defaultSort;
        const { search, query, sort, page, limit } = req.query;

        limit && (defaultLimit = parseInt(limit));
        page && (defaultPage = parseInt(page));
        sort && (defaultSort = { lastName: parseInt(sort) });

        search.length !== 0
            ? defaultQuery = { lastName: search }
            : query !== "0" && (defaultQuery = { rol: query });

        const usersGetted = await usersService.findPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort);
        usersGetted
            ? res.status(200).send({ status: "Success", users: usersGetted })
            : res.status(500).send({ status: "ERROR" });
    } catch (error) {
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};

/**
 * Crea un nuevo usuario
 * Si el rol es "Doctor", valida campos adicionales y crea registro en colección Doctor
 */
export const createUser = async (req, res) => {
    try {
        const user = req.body;
        const userSession = req.user; // Usuario autenticado

        // Validación de campos de Doctor en el controller
        const isDoctor = String(user?.rol || "").toLowerCase() === "doctor";
        if (isDoctor) {
            const df = (user?.doctorFields && typeof user.doctorFields === "object")
                ? user.doctorFields
                : user;

            const missingFields = ["dni", "phone", "professionalLicense"]
                .filter(field => !df?.[field]);

            if (missingFields.length) {
                return res.status(400).send({
                    status: "ERROR",
                    message: `Faltan campos de Doctor: ${missingFields.join(", ")}`
                });
            }
        }

        // Llamar al service
        const userCreated = await usersService.createUser(user, userSession);
        // Manejo de errores del service
        /* if (!userCreated.status) {
            // Email duplicado
            if (userCreated.error?.code === 11000) {
                return res.status(409).send({
                    status: "ERROR",
                    message: "El email ya existe"
                });
            }

            // Campos de Doctor faltantes (fallback si el service también valida)
            if (userCreated.error?.code === "MISSING_DOCTOR_FIELDS") {
                return res.status(400).send({
                    status: "ERROR",
                    message: userCreated.error.message
                });
            }

            // Error genérico
            return res.status(500).send({ status: "ERROR" });
        } */

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
                const currentUser = await usersService.findRawByFilter(userID);
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
        const userUpdated = await usersService.updateUser(userID, userData, userSession);

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

        const userDeleted = await usersService.deleteUser(userID, userSession);

        userDeleted
            ? res.status(200).send({ status: "Success", user: userDeleted })
            : res.status(404).send({ status: "ERROR", message: "Usuario no encontrado" });

    } catch (error) {
        console.error("[deleteUser] Error:", error);
        res.status(500).send({ status: "ERROR", message: error.message });
    }
};