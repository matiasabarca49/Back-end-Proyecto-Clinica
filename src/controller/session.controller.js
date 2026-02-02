import AuthService from "../service/auth.service.js";


const authService = new AuthService();

// =======================
// LOGIN ORIGINAL (SIN 2FA)
// =======================
export const loginUser = async (req,res)=>{
    const {email, password } = req.body;
    try {  
        const loginData = await authService.login({email: email, password: password});
       //Generar token
       res.cookie('token', loginData.token, {
            httpOnly: true, // Asegura que solo sea accesible por el servidor
            sameSite: 'strict', // Protección CSRF
            maxAge: 3600000, // Tiempo de expiración en milisegundos (1 hora)
        });

       return res.status(200).send({ status: "Success" , userData: loginData});

    } catch (error) {
        console.log(error)
        return res.status(500).send({status:"Error", reason: error.message || "Error en el servidor. Intente más tarde"})
    }
}

// =======================
// LOGIN CON 2FA (PRIMER PASO - ENVÍO DEL CÓDIGO)
// =======================
export const loginUser2fa = async (req, res) => {
  try {
    const { email, password } = req.body;
    const login2factor = await authService.login2factor({email: email, password: password});

    // Respuesta en el mismo patrón (Success/Error)
    // Devolvemos estado de flujo "PENDING" + userId para verificar en el siguiente paso
    return res.status(200).send({
      status: login2factor.status,
      state: "PENDING",
      message: login2factor.message,
      userId: login2factor.key // string
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "Error",
      reason: error.message || "Error en el servidor. Intente más tarde",
    });
  }
};

// =======================
// VERIFICAR 2FA (SEGUNDO PASO)
// =======================
export const verify2FA = async (req, res) => {
  try {
    const { userId, email, code } = req.body;
    
    const loginVerification = await authService.verify2factor(userId, email, code);

    res.cookie("token", loginVerification.token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000, // 1 hora
    });

    return res.status(200).send({ status: "Success" , userData: loginVerification});

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "Error",
      reason: error.message || "Error en el servidor. Intente más tarde",
    });
  }
};

// =======================
// CURRENT USER
// =======================
export const currentUser = async (req, res) => {
  try {
      return req.user 
          ? res.status(200).send({ status: "OK", userCurrent: req.user })
          : res.status(400).send({ status:"Error", reason: "User Not Loged" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status:"Error", reason: "Error en el servidor. Intente más tarde" });
    }
};

// =======================
// LOGOUT
// =======================
export const disconnectUser = async (req, res) =>{
    try {
      const cookieFounded = req.cookies.token;

      if(!cookieFounded){
        return res.status(400).send({ status:"Error", reason: "User Not Loged" });
      }

      res.clearCookie('token'); 

      const deletedSession = await  authService.logout(req.user.id);
      
      return res.status(200).send({ status:"Success", reason: "User Disconnected" })
          
      
    } catch (error) {
        console.log(error);
        return res.status(500).send({status:"Error", reason:  error.message || "Error en el servidor. Intente más tarde"});
    }
};