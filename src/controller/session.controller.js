import AuthService from "../service/auth.service.js";


const authService = new AuthService();

// =======================
// LOGIN ORIGINAL (SIN 2FA)
// =======================
export const loginUser = async (req,res, next)=>{
    const {email, password } = req.body;
    try {  
        const loginData = await authService.login({email: email, password: password});
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

       return res.status(200).json({ success: true , data: loginData});

    } catch (error) {
        next(error)
    }
}

// =======================
// LOGIN CON 2FA (PRIMER PASO - ENVÍO DEL CÓDIGO)
// =======================
export const loginUser2fa = async (req, res, next) => {
  try {
    const { email} = req.body;
    const login2factor = await authService.login2factor(email);

    // Respuesta en el mismo patrón (Success/Error)
    // Devolvemos estado de flujo "PENDING" + userId para verificar en el siguiente paso
    return res.status(200).json({
      success: login2factor.success,
      data: {
        state: "PENDING",
        message: login2factor.message,
        userId: login2factor.key // string
      }
    });

  } catch (error) {
    next(error)
  }
};

// =======================
// VERIFICAR 2FA (SEGUNDO PASO)
// =======================
export const verify2FA = async (req, res, next) => {
  try {
    const { userId, email, code } = req.body;
    
    const loginVerification = await authService.verify2factor(userId, email, code);

    //Generar cookie con el accessToken y refreshToken
    res.cookie('accessToken', loginVerification.accessToken, {
        httpOnly: true, // Asegura que solo sea accesible por el servidor no por javascript del cliente
        sameSite: 'strict', // Protección CSRF
        maxAge:  30 * 60 * 1000, // Tiempo de expiración en milisegundos (30 minutos)
    });

    res.cookie('refreshToken', loginVerification.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return res.status(200).json({ success: true , data: loginVerification});

  } catch (error) {
    next(error)
  }
};

export const changePassword = async (req, res, next) =>{
  try {
    const {currentPassword, newPassword} = req.body

    const updatedPassoword = await authService.changePassword(currentPassword, newPassword, req.user);

    return res.status(200).json({success: true, data: updatedPassoword})

  } catch (error) {
    next(error)
  }

}

// =======================
// CURRENT USER
// =======================
export const currentUser = async (req, res, next) => {
  try {

      if(!req.user) throw new UnauthorizedError('Usuario no autenticado');
    
    
      return res.status(200).json({ success: true, data: req.user })
         
    } catch (error) { 
        next(error)
    }
};

// =======================
// LOGOUT
// =======================
export const disconnectUser = async (req, res, next) =>{
    try {

      // Verificar si la cookie de acceso existe
      const cookieFounded = req.cookies.accessToken;
      
      if(!cookieFounded){
        return res.status(400).json({ success: false, error: "El usuario no tiene sesión activa"});
      }

      //Obtener el refresh token de la cookie
      const refreshToken = req.cookies.refreshToken;

      const deletedSession = await  authService.logout(req.user.id, refreshToken);

      // Limpiar las cookies de sesión
      res.clearCookie('accessToken'); 
      res.clearCookie('refreshToken'); 
      
      return res.status(200).json({ success: true, data: {message: "Usuario desconectado correctamente", deletedSession: deletedSession}});
          
      
    } catch (error) {
        next(error)
    }
};

export const refreshToken = async (req, res, next) => {
    try {
      
      const TokenData = await authService.refreshSession(req.user.id, req.cookies.refreshToken);

      //Generar cookie con el accessToken y refreshToken
      res.cookie('accessToken', TokenData.accessToken, {
          httpOnly: true, // Asegura que solo sea accesible por el servidor no por javascript del cliente
          sameSite: 'strict', // Protección CSRF
          maxAge:  30 * 60 * 1000, // Tiempo de expiración en milisegundos (30 minutos)
      });

      res.cookie('refreshToken', TokenData.refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      res.status(200).json({ success: true, data: {message: "Tokens regenerados correctamente"}})

    }
    catch (error) {
        next(error)
    }
}