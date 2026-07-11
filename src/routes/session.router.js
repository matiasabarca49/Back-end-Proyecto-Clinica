import express from 'express';
import { currentUser, disconnectUser, loginUser,verify2FA,loginUser2fa, changePassword, refreshToken } from '../controller/session.controller.js';
import { forgotPassword,resetPassword } from '../controller/password.controller.js';
import { authRefreshToken, authToken} from '../middlewares/auth.middlewares.js';

const { Router } = express;
const router = new Router();

/**
 * @route GET /api/session/current
 * @desc Obtener información del usuario autenticado
 * @access Privado (requiere token de acceso)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @returns {Object} Información del usuario autenticado o mensaje de error si no está autenticado
*/
router.get("/current", authToken, currentUser);

/**
 * @route GET /api/session/disconnect
 * @desc Cerrar sesión del usuario autenticado
 * @access Privado (requiere token de acceso)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
 * @returns {Object} Mensaje de éxito o error
*/
router.get("/disconnect", authToken, disconnectUser);

/**
 * Inicio de sesión del usuario
 * 
 * @route POST /api/session/login
 * @desc Inicio con usuario y contraseña, genera tokens de acceso y refresco
 * @access Público
 * @returns {Object} Objeto con tokens de acceso y refresco, o mensaje de error si las credenciales son inválidas
*/
router.post("/login", loginUser);

/**
 * @route POST /api/session/login-2fa
 * @desc  Inicio de sesión con código de verificación. Se envia el código al correo del usuario.
 * @access Público
*/
router.post("/login-2fa", loginUser2fa);

/**
 * @route POST /api/session/verify-2fa
 * @desc  Segundo paso de verificación, genera tokens de acceso y refresco
 * @access Público
*/
router.post("/verify-2fa", verify2FA);

/**
 * Regeneración de token de acceso usando el refresh token
 * 
 * @route POST /api/session/refresh-token
 * @desc  Este endpoint permite regenerar un token de acceso válido utilizando un refresh token. El refresh token debe ser enviado en la cookie de la solicitud. Produce rotación de tokens, invalidando el refresh token anterior y generando uno nuevo. Se actualizan las cookies de sesión con los nuevos tokens.
 * @access Público
 * @middleware authRefreshToken: Verifica el refresh token en la cookie y valida la sesión en Redis. Si es válido, permite continuar con la regeneración del token de acceso.
*/
router.post("/refresh-token", authRefreshToken, refreshToken);

/**
 * @route POST /api/session/forgot-password
 * @access Público
*/
router.post("/forgot-password", forgotPassword);

/**
 * @route POST /api/session/reset-password
 * @access Público
*/
router.post("/reset-password", resetPassword);

/**
 * @route POST /api/session/change-password
 * @desc  Permite al usuario cambiar su contraseña actual con la session activa. Se requiere que el usuario esté autenticado y tenga un token de acceso válido en la cookie. La nueva contraseña se valida y se actualiza en la base de datos.
 * @access Privado (requiere token de acceso)
 * @middleware authToken: Verifica el token de acceso en la cookie y valida la sesión en Redis
*/
router.patch("/change-password", authToken, changePassword)


export default router;
