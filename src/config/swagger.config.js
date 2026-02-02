const swaggerOption = {
    definition: {
        openapi: '3.1.1',
        info: {
          title: "API Clínica",
          description: "Esta API sirve  proporciona funcionalidades esenciales para la gestión de usuarios e historias clínicas,autenticación, autorización y manejo de datos. Construida con Node.js y Express, incluye soporte para bases de datos MongoDB, implementa prácticas de seguridad modernas y está documentada con Swagger para facilitar su integración.",
        }
    },
    apis:[`./src/docs/*.yaml`]
}

export {
    swaggerOption
}