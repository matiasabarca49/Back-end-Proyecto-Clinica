# Instalación del Proyecto

## 1. Introducción

Este documento describe los pasos necesarios para instalar y ejecutar la API de gestión para una clínica odontológica en un entorno local para pruebas.

---

# 2. Requisitos Previos

Antes de ejecutar el proyecto, es necesario tener instaladas las siguientes herramientas:

- Node.js (versión 20 o superior)
- npm
- MongoDB Atlas o una instancia local de MongoDB
- Git
- Servidor Redis levantado.

Opcional:

- Docker
- Kubernetes (para despliegue en contenedores)

---

# 3. Clonar el repositorio

Clonar el repositorio del proyecto:

```bash
git clone <URL_Repositorio>
```

Ingresar al directorio del proyecto -> cd /Back-end-Proyecto-Clinica

# 4. Instalar dependencias

Instalar las dependencias del proyecto:

```
npm install
```

# 5. Configurar variables de entorno

Crear un archivo .env en la raíz del proyecto.

```
DATABASE_URL=mongodb://<IP_SERVIDOR_DB o localhost>/clinica_odontologica
SECRET_SESSIONS=UNA_CLAVE_SECRETA_PARA_LAS_SESIONES
PORT=PUERTO_PARA_ACCEDER_A_LA_API
PORT_REDIS=PUERTO_REDIS_O_6379
HOST_REDIS=<IP_SERVIDOR_REDIS O localhost>
RESET_SECRET=una_clave_segura_para_reset
RESET_EXPIRES=TIEMPO_EXPIRACION
//========== Autenticación con Google ============
GOOGLE_CLIENT_ID=ID_GOOGLE
GOOGLE_CLIENT_SECRET=SECRETO_GOOGLE
GOOGLE_CALLBACK_URL= http://<IP_BACKEND o localhost>/api/auth/google/callback 
//========== Envío de Emails ===========
EMAIL_USER=CORREO_QUE_ENVIARÁ_EMAILS
EMAIL_PASS=CLAVE_PARA_APIS
```

**NOTA:** No es necesario contar con credenciales de Google ni Emails para probar la API. En caso de no proporcionarlas, la API desactivará esas caracteristicas.

La API puede funcionar sin autenticación con Google ni envio de emails.

Por otra parte puede indicar el origen del Frontend para evitar el bloqueo de CORS de su Front:

```
ORIGIN_FRONTEND=http://localhost:5173
```

Si no la incluye, por defecto será http://localhost:5173

# 6. Ejecutar el servidor

**NOTA:** Es necesario levantar un servidor Redis antes de levantar la API.

Ejecutar el servidor en desarrollo:

```
npm run dev
```

Para ejecutar en modo producción:

```
npm start
```

Una vez iniciado, el servidor estará disponible en:

```
http://<IP_SERVIDOR O localhost>:<PORT O 8080>
```

# 6.1 Solicitudes a los Endpoints

Los endpoints se encuentran protegidos con credenciales. En el momento de levantar el servidor por primera vez no tendrá un usuario administrador. Puede crear uno con el siguiente comando:

Con el servidor levantado aplique el siguiente comando:

```
npm run create-admin -- -e <email> -p <password> -n <nombre_usuario>
``` 

**NOTA:** En caso de querer probar los endpoints en el navegador, en la raíz del servidor se encuentra un formulario de autenticación.

# 8. Documentación de la API

La API REST del sistema se encuentra documentada mediante Swagger.

Una vez iniciado el servidor, la documentación se puede acceder desde:

```
http://SOCKET/api/docs
```