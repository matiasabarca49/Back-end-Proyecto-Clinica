/**
 * Helpers para el envío de emails
 * Funciones utilitarias para centralizar el envío de correos
 */

import transporter from "../config/mailer.config.js";

const SENDER_NAME = "Clínica Odontológica";
const EMAIL_USER = process.env.EMAIL_USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Colores del tema (sincronizados con el sistema)
const COLORS = {
  primary: "#1f2667",      // Azul navy principal del sistema
  primaryLight: "#2563eb", // Azul intermedio
  primaryGradientStart: "#2563eb", // Para gradientes
  primaryGradientEnd: "#9333ea",   // Púrpura del gradiente
  success: "#10b981",      // Verde (disponible)
  warning: "#f59e0b",      // Naranja (recordatorios)
  danger: "#ef4444",       // Rojo
  dark: "#1e293b",         // Gris oscuro
  light: "#f8fafc",        // Gris muy claro
  border: "#f1f5f9"        // Gris borde claro
};

/**
 * Template base HTML para todos los emails
 * Diseño profesional, responsive y consistente
 */
const emailTemplate = (content, accentColor = COLORS.primary) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SENDER_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  
  <!-- Container principal -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Card principal -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
          
          <!-- Header con azul navy sólido -->
          <tr>
            <td style="background: #1f2667; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🏥 ${SENDER_NAME}
              </h1>
            </td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${COLORS.light}; padding: 30px 40px; text-align: center; border-top: 1px solid ${COLORS.border};">
              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 13px;">
                © ${new Date().getFullYear()} ${SENDER_NAME}. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
`;

/**
 * Componente: Botón de acción
 */
const buttonHTML = (text, url, color = COLORS.primary) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

/**
 * Componente: Info box destacada
 */
const infoBoxHTML = (items, bgColor = COLORS.light, borderColor = COLORS.border) => `
  <div style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 8px; padding: 20px; margin: 25px 0;">
    ${items.map(item => `
      <p style="margin: 12px 0; color: ${COLORS.dark}; font-size: 15px; line-height: 1.6;">
        <strong style="color: ${COLORS.dark};">${item.label}:</strong> ${item.value}
      </p>
    `).join('')}
  </div>
`;

/**
 * Componente: Lista con viñetas
 */
const bulletListHTML = (items) => `
  <ul style="margin: 20px 0; padding-left: 20px; color: #4B5563;">
    ${items.map(item => `<li style="margin: 8px 0; line-height: 1.6;">${item}</li>`).join('')}
  </ul>
`;

/**
 * Función base para enviar emails
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
};

/**
 * Envía un email con el código de verificación 2FA
 */
export const send2FACode = async (email, name, code) => {
  const content = `
    <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${name || email}</strong>,
    </p>
    
    <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
      Recibimos una solicitud de acceso a tu cuenta. Usá este código para continuar:
    </p>
    
    <div style="background: linear-gradient(135deg, ${COLORS.primaryLight}15 0%, ${COLORS.primaryLight}08 100%); border: 2px dashed ${COLORS.primaryLight}; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
      <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
        Tu código de verificación
      </p>
      <p style="margin: 0; color: ${COLORS.primaryLight}; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
        ${code}
      </p>
    </div>
    
    <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
      ⏱️ Este código expira en <strong>5 minutos</strong>
    </p>
    
    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 6px; padding: 15px; margin: 25px 0 0 0;">
      <p style="margin: 0; color: #92400E; font-size: 14px;">
        ⚠️ Si no solicitaste este código, ignorá este correo.
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `🔐 Tu código de verificación: ${code}`,
    html: emailTemplate(content, COLORS.primary),
  });
};

/**
 * Envía un email notificando un login exitoso
 */
export const sendLoginSuccessNotification = async (email, name) => {
  const loginDate = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "full",
    timeStyle: "short"
  });

  const content = `
    <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${name || email}</strong>,
    </p>
    
    <div style="background-color: #D1FAE5; border-left: 4px solid ${COLORS.success}; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 8px 0; color: ${COLORS.success}; font-weight: 600; font-size: 15px;">
        ✅ Inicio de sesión exitoso
      </p>
      <p style="margin: 0; color: #065F46; font-size: 14px;">
        📅 ${loginDate}
      </p>
    </div>
    
    <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 20px 0;">
      Si este acceso no fue realizado por vos, cambiá tu contraseña de inmediato.
    </p>
    
    ${buttonHTML('Cambiar contraseña', `${FRONTEND_URL}/reset-password`, COLORS.danger)}
    
    <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
      🔒 Tu seguridad es nuestra prioridad
    </p>
  `;

  return await sendEmail({
    to: email,
    subject: "✅ Inicio de sesión exitoso",
    html: emailTemplate(content, COLORS.success),
  });
};

/**
 * Envía un email con el enlace para resetear la contraseña
 */
export const sendPasswordResetEmail = async (email, name, token, expiresIn = "15m") => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const content = `
    <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${name || email}</strong>,
    </p>
    
    <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
      Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón para continuar:
    </p>
    
    ${buttonHTML('🔐 Restablecer contraseña', resetUrl, COLORS.primaryLight)}
    
    <p style="color: #9CA3AF; font-size: 14px; line-height: 1.6; margin: 20px 0; text-align: center;">
      ⏱️ Este enlace es válido por <strong>${expiresIn}</strong>
    </p>
    
    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 6px; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #92400E; font-size: 14px;">
        ⚠️ Si no solicitaste esto, ignorá este correo.
      </p>
    </div>
    
    <details style="margin: 25px 0; padding: 15px; background-color: ${COLORS.light}; border-radius: 6px; cursor: pointer;">
      <summary style="color: #6B7280; font-size: 13px; font-weight: 600;">
        🧪 Token para testing
      </summary>
      <pre style="margin: 10px 0 0 0; padding: 10px; background-color: #ffffff; border: 1px solid ${COLORS.border}; border-radius: 4px; font-size: 11px; overflow-x: auto; color: #4B5563;">${token}</pre>
    </details>
  `;

  return await sendEmail({
    to: email,
    subject: "🔐 Recuperación de contraseña",
    html: emailTemplate(content, COLORS.primary),
  });
};

/**
 * Envía un email confirmando que la contraseña fue actualizada
 */
export const sendPasswordUpdatedEmail = async (email, name) => {
  const content = `
    <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${name || email}</strong>,
    </p>
    
    <div style="background-color: #D1FAE5; border-left: 4px solid ${COLORS.success}; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <div style="font-size: 48px; margin: 0 0 15px 0;">🔒</div>
      <p style="margin: 0; color: ${COLORS.success}; font-weight: 600; font-size: 16px;">
        Tu contraseña fue actualizada correctamente
      </p>
    </div>
    
    <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 20px 0;">
      Tu cuenta ahora está protegida con la nueva contraseña.
    </p>
    
    <div style="background-color: #FEE2E2; border-left: 4px solid ${COLORS.danger}; border-radius: 6px; padding: 15px; margin: 25px 0;">
      <p style="margin: 0; color: #991B1B; font-size: 14px;">
        ⚠️ Si <strong>NO</strong> realizaste este cambio, contactanos de inmediato.
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: "✅ Contraseña actualizada",
    html: emailTemplate(content, COLORS.success),
  });
};

/**
 * Envía un email genérico personalizado
 */
export const sendCustomEmail = async (email, subject, message, name) => {
  const content = `
    <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${name || email}</strong>,
    </p>
    
    <div style="color: #6B7280; font-size: 15px; line-height: 1.8; margin: 25px 0;">
      ${message}
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html: emailTemplate(content, COLORS.primary),
  });
};

/**
 * Envía un email confirmando la reserva de un turno
 */
export const sendAppointmentConfirmation = async (
  patientEmail,
  patientName,
  appointmentDate,
  appointmentTime
) => {
  const date = new Date(appointmentDate);
  const formattedDate = date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Argentina/Buenos_Aires"
  });

  const content = `
    <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${patientName}</strong>,
    </p>
    
    <div style="background-color: #D1FAE5; border-left: 4px solid ${COLORS.success}; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <div style="font-size: 48px; margin: 0 0 10px 0;">✅</div>
      <p style="margin: 0; color: ${COLORS.success}; font-weight: 600; font-size: 18px;">
        ¡Tu turno fue reservado exitosamente!
      </p>
    </div>
    
    ${infoBoxHTML([
      { label: '📅 Fecha', value: formattedDate },
      { label: '🕐 Horario', value: appointmentTime }
    ], '#EFF6FF', COLORS.primary)}
    
    <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 25px 0 0 0;">
      Te enviaremos un recordatorio el día de tu cita. ¡Te esperamos!
    </p>
  `;

  return await sendEmail({
    to: patientEmail,
    subject: `✅ Turno Confirmado - ${formattedDate}`,
    html: emailTemplate(content, COLORS.success),
  });
};

/**
 * Envía un email recordatorio de turno
 */
export const sendAppointmentReminder = async (
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  room,
  typeAppointment
) => {
  const date = new Date(appointmentDate);
  const formattedDate = date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Argentina/Buenos_Aires"
  });

  const infoItems = [
    { label: '📅 Fecha', value: formattedDate },
    { label: '🕐 Horario', value: appointmentTime },
    { label: '👨‍⚕️ Profesional', value: doctorName }
  ];
  
  if (room) infoItems.push({ label: '🏥 Consultorio', value: room });
  if (typeAppointment) infoItems.push({ label: '📋 Tipo', value: typeAppointment });

  const content = `
    <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hola <strong>${patientName}</strong>,
    </p>
    
    <div style="background-color: #FEF3C7; border-left: 4px solid ${COLORS.warning}; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <div style="font-size: 48px; margin: 0 0 10px 0;">🔔</div>
      <p style="margin: 0; color: #92400E; font-weight: 600; font-size: 18px;">
        ¡Recordá que tenés un turno HOY!
      </p>
    </div>
    
    ${infoBoxHTML(infoItems, '#FEF3C7', COLORS.warning)}
    
    <div style="background-color: ${COLORS.light}; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: ${COLORS.dark}; font-weight: 600; font-size: 15px;">
        📝 Recordá:
      </p>
      ${bulletListHTML([
        'Llegá 10 minutos antes',
        'Traé tu documentación y credencial',
        'Si no podés asistir, avisanos lo antes posible'
      ])}
    </div>
    
    <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
      ¡Te esperamos! 👋
    </p>
  `;

  return await sendEmail({
    to: patientEmail,
    subject: `🔔 Recordatorio: Turno HOY - ${formattedDate}`,
    html: emailTemplate(content, COLORS.warning),
  });
};