// ============================================
// controller/session.controller.js
// ============================================
import UsersService from "../service/mongo/user.service.js";
import { isValidPassword } from "../utils/utils.js";
import { generateToken } from "../middlewares/middlewares.js";
import transporter from "../config/mailer.config.js"; 
import { getRedisClient } from "../config/redis.config.js";

import { send2FACode, sendLoginSuccessNotification } from "../utils/email.helpers.js";

const usersService = new UsersService();
const pendingCodes = new Map();

// =======================
// LOGIN ORIGINAL (SIN 2FA)
// =======================
export const loginUser = async (req,res)=>{
    const {email, password } = req.body;
    try {  
        const userFounded = await usersService.getAllUserByFilter({email: email});
        if(!userFounded){
            res.clearCookie('token'); // Borrar la cookie
            res.status(401).send({status: "ERROR", reason: "Credenciales Incorrectas"})
        }else{
            if(!isValidPassword(userFounded, password)){
                res.clearCookie('token'); // Borrar la cookie
                res.status(401).send({status: "ERROR", reason: "Credenciales Incorrectas"})
            }
            else{
                const token = generateToken(userFounded);
                const {_id, email, rol} = userFounded;
                // Configurar la cookie
                res.cookie('token', token, {
                    httpOnly: true, // Asegura que solo sea accesible por el servidor
                    sameSite: 'strict', // Protección CSRF
                    maxAge: 3600000, // Tiempo de expiración en milisegundos (1 hora)
                });

                //Guardar usuario en redis que expira en 1h
                const redisClient = await getRedisClient()
                await redisClient.set(`session:${_id}`, 'true', { EX: 3600 });

                //req.user = userFounded;
                res.status(200).send({ status: "Success" , userData: { token, id: _id, email: email, rol: rol}});
            }
        }  
    } catch (error) {
        console.log(error)
        res.status(500).send({status:"Error", reason: "Error en el servidor. Intente más tarde"})
    }
}

// =======================
// LOGIN CON 2FA (PRIMER PASO - ENVÍO DEL CÓDIGO)
// =======================
export const loginUser2fa = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFounded = await usersService.getAllUserByFilter({ 
      email: String(email || '').trim() 
    });

    if (!userFounded || !isValidPassword(userFounded, password)) {
      res.clearCookie('token');
      return res.status(401).send({ 
        status: "Error", 
        reason: "Credenciales Incorrectas" 
      });
    }

    // Generar y guardar código (siempre como string) con vencimiento
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos string
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutos
    const key = userFounded._id.toString(); // clave consistente (string)

    pendingCodes.set(key, { code, expires });

    // Enviar email con el código usando helper
    const sent = await send2FACode(
      userFounded.email, 
      userFounded.name, 
      code
    );

    if (!sent) {
      pendingCodes.delete(key);
      return res.status(500).send({
        status: "Error",
        reason: "No se pudo enviar el código. Intente más tarde"
      });
    }

    // Respuesta en el mismo patrón (Success/Error)
    // Devolvemos estado de flujo "PENDING" + userId para verificar en el siguiente paso
    return res.status(200).send({
      status: "Success",
      state: "PENDING",
      message: "Código enviado al email",
      userId: key, // string
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "Error",
      reason: "Error en el servidor. Intente más tarde",
    });
  }
};

// =======================
// VERIFICAR 2FA (SEGUNDO PASO)
// =======================
export const verify2FA = async (req, res) => {
  const { userId, email, code } = req.body;
  try {
    // Acepta verificar por userId o por email (más flexible)
    let key = userId ? String(userId).trim() : null;

    if (!key && email) {
      const u = await usersService.getAllUserByFilter({ 
        email: String(email).trim() 
      });
      if (!u) {
        return res.status(400).send({ 
          status: "Error", 
          reason: "Usuario no encontrado" 
        });
      }
      key = u._id.toString();
    }

    if (!key) {
      return res.status(400).send({ 
        status: "Error", 
        reason: "Falta userId o email" 
      });
    }

    const entry = pendingCodes.get(key);
    if (!entry) {
      return res.status(400).send({ 
        status: "Error", 
        reason: "No se encontró código pendiente" 
      });
    }

    // Verificar expiración
    if (Date.now() > entry.expires) {
      pendingCodes.delete(key);
      return res.status(400).send({ 
        status: "Error", 
        reason: "Código expirado" 
      });
    }

    // Comparar SIEMPRE como strings limpios
    if (String(code).trim() !== entry.code) {
      return res.status(400).send({ 
        status: "Error", 
        reason: "Código inválido" 
      });
    }

    // Código correcto: generar token, setear cookie, limpiar el pending
    const userFounded = await usersService.getAllUserByFilter({ _id: key });
    if (!userFounded) {
      pendingCodes.delete(key);
      return res.status(400).send({ 
        status: "Error", 
        reason: "Usuario no encontrado" 
      });
    }

    const token = generateToken(userFounded);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000, // 1 hora
    });

    //Guardar usuario en redis que expira en 1h
    const redisClient = await getRedisClient()
    await redisClient.set(`session:${userId}`, 'true', { EX: 3600 });

    // Enviar correo de login exitoso usando helper
    // No romper flujo si falla
    sendLoginSuccessNotification(userFounded.email, userFounded.name)
      .catch(err => console.warn("Aviso de login exitoso falló:", err.message || err));

    pendingCodes.delete(key);

    return res.status(200).send({ 
      status: "Success", 
      token 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "Error",
      reason: "Error en el servidor. Intente más tarde",
    });
  }
};

// =======================
// CURRENT USER
// =======================
export const currentUser = async (req, res) => {
  try {
      req.user 
          ? res.status(200).send({ status: "OK", userCurrent: req.user })
          : res.status(400).send({ status:"Error", reason: "User Not Loged" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status:"Error", reason: "Error en el servidor. Intente más tarde" });
    }
  try {
    req.user
      ? res.status(200).send({ 
          status: "OK", 
          userCurrent: req.user 
        })
      : res.status(400).send({ 
          status: "Error", 
          reason: "User Not Loged" 
        });
  } catch (error) {
    console.log(error);
    res.status(500).send({ 
      status: "Error", 
      reason: "Error en el servidor. Intente más tarde" 
    });
  }
};

// =======================
// LOGOUT
// =======================
export const disconnectUser = async (req, res) =>{
    try {
      const redisClient = await getRedisClient()
      const deletedSession = await redisClient.del(`session:${req.user.id}`);
      const cookieFounded = req.cookies.token;
      res.clearCookie('token'); 
      cookieFounded
          ? res.status(200).send({ status:"Success", reason: "User Disconnected" })
          : res.status(400).send({ status:"Error", reason: "User Not Loged" });
    } catch (error) {
        console.log(error);
        res.status(500).send({status:"Error", reason: "Error en el servidor. Intente más tarde"});
    }
};