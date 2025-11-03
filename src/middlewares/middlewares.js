import jwt from 'jsonwebtoken';
import { getRedisClient } from '../config/redis.config.js';
const secretKey = "yourSecretKey1234"; // Debe coincidir con el que usás para firmar el token

// Generar token
export const generateToken = (user) => {
    const token = jwt.sign(
        { id: user._id, email: user.email, rol: user.rol },
        secretKey,
        { expiresIn: '1h' }
    );
    return token;
};

// Middleware basado en cookies (para rutas protegidas que usan cookies)
export const authToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send({ status: "ERROR", reason: "Not Authenticated" });
    }

    jwt.verify(token, secretKey, async (error, credentials) => {
        if (error) {
            return res.status(403).send({ error: "Not authorized" });
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
            return res.status(401).json({ message: 'Inactive or expired session' });
        }
        next();
    });
};

// Verifica si es admin
export const checkPermissionsAdmin = (req, res, next) => {
    if (req.user.rol === "Admin") {
        next();
    } else {
        res.status(401).send({ status: "Error", reason: "No Autorizado" });
    }
};

// Verifica que esté autenticado
export const checkAuth = (req, res, next) => {
    if (req.user.rol) {
        next();
    } else {
        res.status(401).send({ status: "Error", reason: "No Autenticado" });
    }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).send({ status: "ERROR", reason: "No autorizado" });
    }
    next();
  };
};
