import { generateToken } from "../../utils/middlewares.js";

export const authGoogle = (req, res) => {

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

   // Redirige al frontend con el token como query param
    const redirectUrl = "http://localhost:5173";

    return res.redirect(redirectUrl);
};