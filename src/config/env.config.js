import dotenv from 'dotenv';

dotenv.config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
}); 

export const requiredEnvVars = {
    DATABASE_URL: process.env.DATABASE_URL?.trim(),
    SECRET_SESSIONS: process.env.SECRET_SESSIONS?.trim(),
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.trim(),
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET?.trim(),
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL?.trim(),
    EMAIL_USER: process.env.EMAIL_USER?.trim(), 
    EMAIL_PASS: process.env.EMAIL_PASS?.trim(),
    PORT: process.env.PORT?.trim(),
    PORT_REDIS: process.env.PORT_REDIS?.trim(),
    HOST_REDIS: process.env.HOST_REDIS?.trim(),
    email: true,
    google: true,
};


// Validar que las variables de entorno requeridas estén definidas y no estén vacías
const missing = Object.entries(requiredEnvVars)
    .filter(env => {
        const [, Value] = env;
        return !Value || Value.length === 0})
    .map(([key]) => key);


if (missing.length > 0) {
    console.warn(`Variables de entorno faltantes o vacías:\n- ${missing.join(', \n- ')}`);
}

if( process.env.NODE_ENV !== "test" && !process.env.DATABASE_URL?.trim()){
    console.error("🔴 [Error] Falta la variable de entorno DATABASE_URL");
    process.exit(1);
}

if( !process.env.SECRET_SESSIONS?.trim()){
    console.error("🔴 [Error] Falta la variable de entorno SECRET_SESSIONS");
    process.exit(1);
}

if( !process.env.PORT_REDIS?.trim() || !process.env.HOST_REDIS?.trim()){
    console.warn("⚠️ [Info] Falta la variable de entorno PORT_REDIS o HOST_REDIS. Se utilizará la configuración por defecto para Redis. IP: 127.0.0.1, Puerto: 6379");
}

if(!process.env.ORIGIN_FRONTEND?.trim()){
    console.warn("⚠️ [Info] Falta la variable de entorno ORIGIN_FRONTEND. Se permitiŕa solo desde http://localhost:5173.");
}

if(!process.env.EMAIL_USER?.trim() || !process.env.EMAIL_PASS?.trim()){
    console.warn("⚠️ [Info] Envío de emails Desactivado")
    requiredEnvVars.email = false
}

if(!process.env.PORT?.trim()){
    console.warn("⚠️ [Info] Falta la variable de entorno PORT. Se utilizará el puerto por defecto 8080.");
}

if(!process.env.GOOGLE_CLIENT_ID?.trim() || !process.env.GOOGLE_CLIENT_SECRET?.trim() || !process.env.GOOGLE_CALLBACK_URL?.trim()){
    console.warn("⚠️ [Info] Autenticacion con GOOGLE Desactivada")
    requiredEnvVars.google = false
}

