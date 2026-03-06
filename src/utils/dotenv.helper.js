const requiredEnvVars = {
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
    console.log(`Variables de entorno faltantes o vacías:\n- ${missing.join(', \n- ')}`);
}

if(!process.env.DATABASE_URL?.trim() || !process.env.SECRET_SESSIONS?.trim()){
    console.log("🔴 [Error] Falta una o todas de las variables de entorno requeridas. \n - DATABASE_URL \n - SECRET_SESSIONS");
    process.exit()
}

if(!process.env.EMAIL_USER?.trim() || !process.env.EMAIL_PASS?.trim()){
    console.log("⚠️ [Info] Envío de emails Desactivado")
    requiredEnvVars.email = false
}

if(!process.env.GOOGLE_CLIENT_ID?.trim() || !process.env.GOOGLE_CLIENT_SECRET?.trim() || !process.env.GOOGLE_CALLBACK_URL?.trim()){
    console.log("⚠️ [Info] Autenticacion con GOOGLE Desactivada")
    requiredEnvVars.google = false
}

export const validateEnvVars = (type) => {
    return requiredEnvVars[type];
}

 