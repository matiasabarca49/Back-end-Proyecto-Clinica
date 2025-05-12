import jwt from 'jsonwebtoken';
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

    jwt.verify(token, secretKey, (error, credentials) => {
        if (error) {
            return res.status(403).send({ error: "Not authorized" });
        }
        req.user = {
            id: credentials.id,
            email: credentials.email,
            rol: credentials.rol
        };
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
