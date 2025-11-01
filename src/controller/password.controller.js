// ============================================
// controller/password.controller.js
// ============================================
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model/mongo/user.model.js";
import { 
  sendPasswordResetEmail, 
  sendPasswordUpdatedEmail 
} from "../utils/email.helpers.js";

const RESET_SECRET = process.env.RESET_SECRET || process.env.JWT_SECRET || "resetFallback";
const RESET_EXPIRES = process.env.RESET_EXPIRES || "15m";

// =======================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// =======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // RESPUESTA GENÉRICA para no filtrar existencia del email
    if (!user) {
      return res.json({ 
        message: "Si el email existe, recibirás instrucciones." 
      });
    }

    // Generar token JWT corto
    const token = jwt.sign({ id: user._id }, RESET_SECRET, { 
      expiresIn: RESET_EXPIRES 
    });

    // Enviar mail con Nodemailer usando helper
    const sent = await sendPasswordResetEmail(
      user.email,
      user.name,
      token,
      RESET_EXPIRES
    );

    if (!sent) {
      console.error("No se pudo enviar el email de recuperación");
      // No revelar el error al usuario por seguridad
    }

    return res.json({ 
      message: "Si el email existe, recibirás instrucciones." 
    });
    
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// =======================
// RESETEAR CONTRASEÑA CON TOKEN
// =======================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // Verificar token JWT
    let payload;
    try {
      payload = jwt.verify(token, RESET_SECRET);
    } catch (err) {
      return res.status(400).json({ 
        message: "Token inválido o expirado" 
      });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar y corregir rol si es inválido
    const rolesPermitidos = ["Admin", "Doctor", "Employee"];
    if (!rolesPermitidos.includes(user.rol)) {
      user.rol = "Admin"; // o el rol que prefieras como default
    }

    // Hashear y guardar nueva password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Enviar confirmación usando helper
    // No romper el flujo si falla el email
    sendPasswordUpdatedEmail(user.email, user.name)
      .catch(err => console.warn("Email de confirmación falló:", err.message || err));

    return res.json({ 
      message: "Contraseña actualizada correctamente" 
    });
    
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};