import jwt from 'jsonwebtoken';
import { getRedisClient } from '../config/redis.config.js';

const secretKey = process.env.SECRET_SESSIONS; // Debe coincidir con el que usás para firmar el token

// Generar token
export const generateToken = (user) => {
    const token = jwt.sign(
        { id: user._id || user.id, email: user.email, rol: user.rol },
        secretKey,
        { expiresIn: '1h' }
    );
    return token;
};

// Middleware basado en cookies (para rutas protegidas que usan cookies)
export const authToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, error: { message: "Not Authenticated", statusCode: 401}});
    }

    jwt.verify(token, secretKey, async (error, credentials) => {
        if (error) {
            return res.status(403).json({success: false , error: { message: "Not authorized", statusCode: 403 }});
        }
        req.user = {
            id: credentials.id,
            email: credentials.email,
            rol: credentials.rol
        };
        //Verificar si el usuario sigue activo en redis
        const redisClient = await getRedisClient()
        const isActive = await redisClient.get(`session:${req.user.id}`);
        if(!isActive){
            return res.status(401).json({success: false, error: { message: 'Inactive or expired session', statusCode: 401 }});
        }
        next();
    });
};

// Verifica si es admin
export const checkPermissionsAdmin = (req, res, next) => {
    if (req.user.rol === "admin") {
        next();
    } else {
        res.status(403).json({ success: false, error: {message: "No Autorizado", statusCode:403 }});
    }
};

// Verifica que esté autenticado
export const checkAuth = (req, res, next) => {
    if (req.user.rol) {
        next();
    } else {
        res.status(401).json({ success: false, error: { message: "No Autenticado", statusCode: 401 }});
    }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ success: false, error: { message: "No autorizado", statusCode: 403}});
    }
    next();
  };
};
