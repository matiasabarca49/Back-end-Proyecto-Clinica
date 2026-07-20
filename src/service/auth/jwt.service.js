import { getRedisClient } from "../../config/redis.config.js";
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_SESSIONS

/**
 * Funcion para generar token
 * 
 * @param {Objeto} credentials 
 * @param {String} expire 
 * @returns {String} Token generado
 */
export const generateToken = (credentials, expire) =>{
    return jwt.sign(
        credentials,
        secretKey,
        { expiresIn: expire }
    );
}

/**
 * Generar token de acceso y refresh token
 * 
 * @param {Objeto} user Credenciales del usuario
 * @returns {Object} Con token de acceso y de refresco
 */
export const generateTokens = (user) => {
    const { email, rol } = user

    const accessToken = jwt.sign(
        { id: user._id || user.id, email, rol },
        secretKey,
        { expiresIn: '30min' }
    );

    const refreshToken = jwt.sign(
        { id: user._id || user.id },
        secretKey,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

/**
 * Verificar token de acceso
 * 
 * @param {String}  accessToken Token de acceso
 * @returns {Object | null}  Usuario si el token existe o null en caso de que no
 */
export async function verifyAccessToken(accessToken) {
    try {
        const credentials = jwt.verify(accessToken, secretKey);

        const redisClient = await getRedisClient();
        const isActive = await redisClient.get(`session:${credentials.id}`);

        if (!isActive) return null;

        return {
            id: credentials.id,
            email: credentials.email,
            rol: credentials.rol
        };
    } catch (error) {
        return null;
    }
}

/**
 * Verificar token de acceso
 * 
 * @param {String}  refreshToken Token de acceso
 * @returns {Object | null}  credenciales si el token existe o null en caso de que no
 */
export async function verifyRefreshToken(refreshToken) {
    try{
        const credentials = jwt.verify(refreshToken, secretKey)
             
        //Verificar si el refresh token es valido en redis
        const redisClient = await getRedisClient()
        const isValid = await redisClient.get(`refreshToken:${refreshToken}`);
        
        if(!isValid){
            return null
        }
        
        return {
            id: credentials.id,
        }
            
    }catch(error){
        return null
    }
    
}

