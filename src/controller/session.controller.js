// controller/session.controller.js
import UsersService from "../service/mongo/user.service.js";
import { isValidPassword } from "../utils/utils.js";
import { generateToken } from "../middlewares/middlewares.js";
import transporter from "../config/mailer.config.js"; 
const usersService = new UsersService();

// TEMPORAL: userId -> { code, expires }
const pendingCodes = new Map(); // 👈 agregado

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
// LOGIN (PRIMER PASO - ENVÍO DEL CÓDIGO)
// =======================
export const loginUser2fa = async (req, res) => {
    const { email, password } = req.body;
    try {  
        const userFounded = await usersService.getAllUserByFilter({ email: email });
        if (!userFounded) {
            res.clearCookie('token');
            return res.status(401).send({ status: "ERROR", reason: "Credenciales Incorrectas" });
        }

        if (!isValidPassword(userFounded, password)) {
            res.clearCookie('token');
            return res.status(401).send({ status: "ERROR", reason: "Credenciales Incorrectas" });
        }

        // =======================
        //  2FA - Generar y guardar código
        // =======================
        const code = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutos
        pendingCodes.set(userFounded._id.toString(), { code, expires });

        // =======================
        //  Enviar el mail
        // =======================
        await transporter.sendMail({
            from: `"Clínica" <${process.env.EMAIL_USER}>`,
            to: userFounded.email,
            subject: "Tu código de acceso",
            html: `
                <p>Hola ${userFounded.name},</p>
                <p>Tu código de verificación es: <b>${code}</b></p>
                <p>Este código expira en 5 minutos.</p>
            `,
        });

        // No damos el token todavía
        return res.status(200).send({ 
            status: "PENDING", 
            message: "Código enviado al email",
            userId: userFounded._id 
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ status:"Error", reason: "Error en el servidor. Intente más tarde" });
    }
};

// =======================
// VERIFICAR CÓDIGO (SEGUNDO PASO)
// =======================
export const verify2FA = async (req, res) => {
    const { userId, code } = req.body;
    try {
        const entry = pendingCodes.get(userId);
        if (!entry) {
            return res.status(400).send({ status: "ERROR", reason: "No se encontró código pendiente" });
        }

        if (Date.now() > entry.expires) {
            pendingCodes.delete(userId);
            return res.status(400).send({ status: "ERROR", reason: "Código expirado" });
        }

        if (parseInt(code) !== entry.code) {
            return res.status(400).send({ status: "ERROR", reason: "Código inválido" });
        }

        // ✅ Código correcto → Generar token y setear cookie
        const userFounded = await usersService.getAllUserByFilter({ _id: userId });
        const token = generateToken(userFounded);

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 3600000, // 1 hora
        });

        // 📨 Avisar por correo inicio exitoso
        await transporter.sendMail({
            from: `"Clínica" <${process.env.EMAIL_USER}>`,
            to: userFounded.email,
            subject: "Inicio de sesión exitoso",
            html: `
                <p>Hola ${userFounded.name || userFounded.email},</p>
                <p>Tu inicio de sesión en la clínica fue exitoso el <b>${new Date().toLocaleString()}</b>.</p>
                <p>Si no fuiste vos, por favor <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password">cambiá tu contraseña</a> de inmediato.</p>
                <br/>
                <p>Equipo de Seguridad - Clínica</p>
            `,
        });

        pendingCodes.delete(userId); // borrar el código ya usado

        return res.status(200).send({ status: "SUCCESS", token });
    } catch (error) {
        console.log(error);
        res.status(500).send({
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
