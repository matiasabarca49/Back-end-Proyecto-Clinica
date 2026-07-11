import { getRedisClient } from "../config/redis.config.js";
import { CreateUserRequestDTO } from "../dto/user.dto.js";
import UsersService from "../service/user.service.js";
const usersService = new UsersService();

/**
 * Retorna todos los usuarios
 */
export const getUsers = async (req, res, next) => {
    try {
        const {sort, page, limit } = req.query;
        let usersGetted;
        if(!page && !limit){
            usersGetted = await usersService.findAll();
        }else{
            
            //filtros
            const {search, rol} = req.query;
            usersGetted = await usersService.paginateUsers(search, rol, limit, page, sort);
        }
        
        return res.status(200).json({ success: true, data: usersGetted })
            
    } catch (error) {
        next(error)
    }
};

/**
 * Retorna múltiples usuarios por filtro status o rol
 */
export const searchUsers = async (req, res, next) => {
    try {
        const { status, rol } = req.query;
        if(!status && !rol ) throw new Error("Query necesarias [status, role] ")

        const usersGetted = await usersService.searchUsers({ status, rol});
        
        return res.status(200).json({ success: true, data: usersGetted })

    } catch (error) {
        next(error)
    }
};

/**
 * Retorna un usuario por ID
 */
export const getUserByID = async (req, res, next) => {
    try {
        const userID = req.params.id;
        const userGetted = await usersService.findById(userID);
        
        return res.status(200).json({ success: true, data: userGetted })
            
    } catch (error) {
        next(error)
    }
};


/**
 * Crea un nuevo usuario
 * Si el rol es "Doctor", valida campos adicionales y crea registro en colección Doctor
 */
export const createUser = async (req, res, next) => {
    try {
        //DTO de Request
        const user = new CreateUserRequestDTO(req.body);
        
        // Llamar al service
        const userCreated = await usersService.create(user);
        
        // Éxito
        return res.status(201).json({
            success: true,
            data: userCreated
        });

    } catch (error) {
        next(error)
    }
};

/**
 * Actualiza un usuario existente
 * Sincroniza cambios con la colección Doctor si corresponde
 */
export const updateUser = async (req, res, next) => {
    try {
        const userData = req.body;
        const userID = req.params.id;
        const userSession = req.user;

        // Llamar al service
        const userUpdated = await usersService.update(userID, userData);

        // Éxito
        return res.status(200).json({
            success: true,
            data: userUpdated
        });

    } catch (error) {
        next(error)
    }
};

/**
 * Elimina un usuario
 * También elimina su registro en la colección Doctor si corresponde
 */
export const deleteUser = async (req, res, next) => {
    try {
        const userID = req.params.id;
        const userSession = req.user;

        //Verificando que el usuario a eliminar no tenga una sesión activa
        const redisClient = await getRedisClient()
        const isActive = await redisClient.get(`session:${userID}`)

        if(isActive){
            console.log(`El usuario ${userID} no se puede eliminar porque tiene una sesión activa`)
            return res.status(403).json({ success: false, message: "El usuario tiene una sesión activa" });
        } 

        const userDeleted = await usersService.delete(userID);

        return res.status(200).json({ success: true, message: "Usuario eliminado correctamente", data: userDeleted});

    } catch (error) {
        next(error)
    }
};