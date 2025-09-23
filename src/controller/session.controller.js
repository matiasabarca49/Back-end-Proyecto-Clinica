// controller/session.controller.js
import UsersService from "../service/mongo/user.service.js";
import { isValidPassword } from "../utils/utils.js";
import { generateToken } from "../middlewares/middlewares.js";
import transporter from "../config/mailer.config.js"; 
const usersService = new UsersService();
const pendingCodes = new Map();

// Metodo Original uwu
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
                // Configurar la cookie
                res.cookie('token', token, {
                    httpOnly: true, // Asegura que solo sea accesible por el servidor
                    sameSite: 'strict', // Protección CSRF
                    maxAge: 3600000, // Tiempo de expiración en milisegundos (1 hora)
                });
                req.user = userFounded;
                res.status(200).send({ status: "Success" , token});
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
    const userFounded = await usersService.getAllUserByFilter({ email: String(email || '').trim() });

    if (!userFounded || !isValidPassword(userFounded, password)) {
      res.clearCookie('token');
      return res.status(401).send({ status: "Error", reason: "Credenciales Incorrectas" });
    }

    // Generar y guardar código (siempre como string) con vencimiento
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos string
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutos
    const key = userFounded._id.toString();     // clave consistente (string)

    pendingCodes.set(key, { code, expires });

    // Enviar email con el código
    await transporter.sendMail({
      from: `"Clínica" <${process.env.EMAIL_USER}>`,
      to: userFounded.email,
      subject: "Tu código de acceso",
      html: `
        <p>Hola ${userFounded.name || userFounded.email},</p>
        <p>Tu código de verificación es: <b>${code}</b></p>
        <p>Este código expira en 5 minutos.</p>
      `,
    });

    // 🔔 Importante: RESPUESTA en el mismo patrón (Success/Error).
    // Devolvemos estado de flujo "PENDING" + userId para verificar en el siguiente paso.
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


export const verify2FA = async (req, res) => {
  const { userId, email, code } = req.body;
  try {
    // Acepta verificar por userId o por email (más flexible)
    let key = userId ? String(userId).trim() : null;

    if (!key && email) {
      const u = await usersService.getAllUserByFilter({ email: String(email).trim() });
      if (!u) {
        return res.status(400).send({ status: "Error", reason: "Usuario no encontrado" });
      }
      key = u._id.toString();
    }

    if (!key) {
      return res.status(400).send({ status: "Error", reason: "Falta userId o email" });
    }

    const entry = pendingCodes.get(key);
    if (!entry) {
      return res.status(400).send({ status: "Error", reason: "No se encontró código pendiente" });
    }

    // Expirado
    if (Date.now() > entry.expires) {
      pendingCodes.delete(key);
      return res.status(400).send({ status: "Error", reason: "Código expirado" });
    }

    // Comparar SIEMPRE como strings limpios
    if (String(code).trim() !== entry.code) {
      return res.status(400).send({ status: "Error", reason: "Código inválido" });
    }

    // Código correcto: generar token, setear cookie, limpiar el pending
    const userFounded = await usersService.getAllUserByFilter({ _id: key });
    if (!userFounded) {
      pendingCodes.delete(key);
      return res.status(400).send({ status: "Error", reason: "Usuario no encontrado" });
    }

    const token = generateToken(userFounded);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000, // 1 hora
    });

    // (Opcional) enviar correo de login exitoso — no romper flujo si falla
    try {
      const base = process.env.FRONTEND_URL || "http://localhost:5173";
      await transporter.sendMail({
        from: `"Clínica" <${process.env.EMAIL_USER}>`,
        to: userFounded.email,
        subject: "Inicio de sesión exitoso",
        html: `
          <p>Hola ${userFounded.name || userFounded.email},</p>
          <p>Tu inicio de sesión fue exitoso el <b>${new Date().toLocaleString()}</b>.</p>
          <p>Si no fuiste vos, por favor ${base}/reset-passwordcambiá tu contraseña</a> de inmediato.</p>
          <br/>
          <p>Equipo de Seguridad - Clínica</p>
        `,
      });
    } catch (mailErr) {
      console.warn("Aviso de login exitoso falló:", mailErr && mailErr.message);
    }

    pendingCodes.delete(key);

    return res.status(200).send({ status: "Success", token });

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
};

// =======================
// LOGOUT
// =======================
export const disconnectUser = (req, res) =>{
    try {
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
