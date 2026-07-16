import { verifyAccessToken, verifyRefreshToken } from '../service/jwt.service.js';

//  Verificar usuario autenticado
//  Middleware basado en cookies (para rutas protegidas que usan cookies)
export const authToken = async (req, res, next) => {
    // Obtener el token de acceso de la cookie
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ success: false, error: { message: "Not Authenticated", statusCode: 401}});
    }

    // Verificar el token de acceso
    const user = await verifyAccessToken(token)
   
    if (!user) {
        return res.status(401).json({success: false , error: { message: "Not authorized", statusCode: 403 }});
    }
    req.user = {
        id: user.id,
        email: user.email,
        rol: user.rol
    };
        
    next();
};

export const authRefreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ success: false, error: { message: "No existe el token de refresco", statusCode: 401 }});
    }

    const credentials = await verifyRefreshToken(refreshToken)

    if(!credentials){
        return res.status(401).json({success: false, error: { message: 'Inactive or expired session', statusCode: 401 }});
    }

    req.user = {
        id: credentials.id,
    };

    next();
    
}

export const authRoles = (...roles) => {
    return (req, res, next) => {
        
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ success: false, error: { message: "No autorizado", statusCode: 403}});
        }

        next();
    }
}




