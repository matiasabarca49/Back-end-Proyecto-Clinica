import { generateToken } from "../../utils/middlewares.js";

export const authGoogle = (req, res) => {
  console.log(req.user)
   
  const token = generateToken(req.user);
            // Configurar la cookie
            res.cookie('token', token, {
                httpOnly: true, // Asegura que solo sea accesible por el servidor
                sameSite: 'strict', // Protección CSRF
                maxAge: 3600000, // Tiempo de expiración en milisegundos (1 hora)
            })
       
          
   // Redirige al frontend con el token como query param
    const redirectUrl = `http://localhost:5173/login/google?iduser=${req.user.id}`;

    return res.redirect(redirectUrl);

    
    // Esta parte se comenta porque ya no devolvemos JSON directo, sino que redirigimos con el token

};
