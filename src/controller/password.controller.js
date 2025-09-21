// controller/password.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import transporter from "../config/mailer.config.js";
import { User } from "../model/mongo/user.model.js";

const RESET_SECRET = process.env.RESET_SECRET || process.env.JWT_SECRET || "resetFallback";
const RESET_EXPIRES = process.env.RESET_EXPIRES || "15m";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requerido" });

    const user = await User.findOne({ email: email.toLowerCase() });
    // RESPUESTA GENÉRICA para no filtrar existencia del email
    if (!user) return res.json({ message: "Si el email existe, recibirás instrucciones." });

    // Generar token JWT corto
    const token = jwt.sign({ id: user._id }, RESET_SECRET, { expiresIn: RESET_EXPIRES });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  // Enviar mail con Nodemailer (Gmail)
await transporter.sendMail({
  from: `"Clínica" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: "Recuperación de contraseña",
  html: `
    <p>Hola ${user.name || user.email},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. El enlace es válido por ${RESET_EXPIRES}.</p>
    <p><a href="${resetUrl}">Hacé clic aquí para restablecer tu contraseña</a></p>
    <p><strong>Token para testing:</strong></p>
    <pre>${token}</pre>
    <p>Si no solicitaste esto, ignorá este correo.</p>
  `,
});

    return res.json({ message: "Si el email existe, recibirás instrucciones." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Faltan datos" });

    let payload;
    try {
      payload = jwt.verify(token, RESET_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Validar y corregir rol si es inválido
    const rolesPermitidos = ["Admin", "Doctor", "Employee"];
    if (!rolesPermitidos.includes(user.rol)) {
      user.rol = "Admin"; // o el rol que prefieras como default
    }

    // Hashear y guardar nueva password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // (Opcional) enviar confirmación
    await transporter.sendMail({
      from: `"Clínica" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Contraseña actualizada",
      html: `<p>Tu contraseña fue actualizada correctamente. Si no fuiste vos, contactanos.</p>`,
    });

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};
