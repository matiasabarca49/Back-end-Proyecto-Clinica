import AuthService from "../../service/auth.service.js";
const authService = new AuthService()


export const authGoogle = async (req, res) => {

    try{
        const userData = await authService.loginGoogle(req.user)
        
         // Configurar la cookie
         res.cookie('token', userData.token, {
             httpOnly: true, // Asegura que solo sea accesible por el servidor
             sameSite: 'strict', // Protección CSRF
             maxAge: 3600000, // Tiempo de expiración en milisegundos (1 hora)
         })
     
        /* // Redirige al frontend con el token como query param
         const redirectUrl = "http://localhost:5173";
     
         return res.redirect(redirectUrl); */

         // Reemplazamos la entrada del backend por el Home
         return res.send(`
                <script>
                    window.location.replace("http://localhost:5173");
                </script>
            `);
    }catch(error){
        console.log(error)
        return res.redirect("http://localhost:5173/login")
    }

};