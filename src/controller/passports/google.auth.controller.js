import { getRedisClient } from "../../config/redis.config.js";
import { generateToken } from "../../middlewares/middlewares.js";

export const authGoogle = async (req, res) => {

    //Formatear para cambiar el ID por _ID
    const userFormated = {
            _id: req.user.id,
            name: req.user.name,
            lastName: req.user.lastName,
            email: req.user.email,
            rol: req.user.rol
    }
   
   const token = generateToken(userFormated);
   
    // Configurar la cookie
    res.cookie('token', token, {
        httpOnly: true, // Asegura que solo sea accesible por el servidor
        sameSite: 'strict', // Protección CSRF
        maxAge: 3600000, // Tiempo de expiración en milisegundos (1 hora)
    })

    //Guardar usuario en redis que expira en 1h
    const redisClient = await getRedisClient()
    await redisClient.set(`session:${userFormated._id}`, 'true', { EX: 3600 });

   // Redirige al frontend con el token como query param
    const redirectUrl = "http://localhost:5173";

    return res.redirect(redirectUrl);
};