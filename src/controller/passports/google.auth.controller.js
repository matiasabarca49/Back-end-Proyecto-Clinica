import AuthService from "../../service/auth/auth.service.js";
const authService = new AuthService()


export const authGoogle = async (req, res) => {

    try{
        const loginData = await authService.loginGoogle(req.user)
        
        //Generar cookie con el accessToken y refreshToken
        res.cookie('accessToken', loginData.accessToken, {
            httpOnly: true, // Asegura que solo sea accesible por el servidor no por javascript del cliente
            sameSite: 'strict', // Protección CSRF
            maxAge:  30 * 60 * 1000, // Tiempo de expiración en milisegundos (30 minutos)
        });

        res.cookie('refreshToken', loginData.refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });
     
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