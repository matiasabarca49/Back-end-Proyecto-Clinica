# Instalación del Proyecto

## 1. Introducción

Este documento describe los pasos necesarios para instalar y ejecutar la API de gestión para una clínica odontológica en un entorno local para pruebas.

---

# 2. Requisitos Previos

Antes de ejecutar el proyecto, es necesario tener instaladas las siguientes herramientas:

- Node.js (versión 20 o superior)
- pnpm (version 10 o superior)
- MongoDB Atlas o una instancia local de MongoDB
- Git
- Servidor Redis levantado.

Opcional:

- Docker
- Kubernetes (para despliegue en contenedores)

El sistema requiere una instancia de MongoDB y un servidor Redis para su funcionamiento. Para facilitar la configuración del entorno de desarrollo, estos servicios pueden levantarse mediante Docker Compose. 

Revisa la guía [despliegue en docker](despliegue-docker.md) para levantar los servicios necesarios. 

---

Node.js se puede descargar desde su página oficial:

[Node JS](https://nodejs.org/en)

O desde la terminal de linux:

```
sudo apt install nodejs
```

El instalador de Node.js incluye la herramienta **npm**, que permite gestionar paquetes de JavaScript. En este proyecto se utiliza **pnpm** como gestor de paquetes.

## Instalación de pnpm

Una vez instalado Node.js, pnpm puede instalarse utilizando Corepack, una herramienta incluida con Node.js:

```
corepack enable
corepack prepare pnpm@latest --activate
```
**NOTA:** Puede que necesite permisos de administrador  

Verificar instalación:
```
pnpm -v
```

---

# 3. Clonar el repositorio

Clonar el repositorio del proyecto:

```bash
git clone https://github.com/matiasabarca49/Back-end-Proyecto-Clinica.git
```

Ingresar al directorio del proyecto -> cd /Back-end-Proyecto-Clinica

# 4. Instalar dependencias

Instalar las dependencias del proyecto:

```
pnpm install
```

# 5. Configurar variables de entorno

Crear un archivo .env en la raíz del proyecto según el entorno a ejecutar:

- .env.development
- .env.production

La API buscará el archivo del entorno especificado en la variable NODE_ENV:

```
NODE_ENV=<environment>
```
**NOTA:** Los valores posibles son: development, production o test. En caso de no especificar el entorno, se buscará por defecto un archivo llamado **.env.delopment**  

Ejemplo de archivo env:

```
NODE_ENV=development
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

## 5.1 Bloqueo CORS

Por otra parte puede indicar el origen del Frontend para evitar el bloqueo de CORS de su Front:

```
ORIGIN_FRONTEND=http://localhost:5173
```

Si no la incluye, por defecto será http://localhost:5173

# 6. Ejecutar el servidor

**NOTA:** Es necesario levantar un servidor Redis antes de levantar la API.

Ejecutar el servidor en desarrollo:

```
pnpm dev
```

Para ejecutar en modo producción:

```
pnpm start
```

Una vez iniciado, el servidor estará disponible en:

```
http://<IP_SERVIDOR O localhost>:<PORT O 8080>
```

# 6.1 Solicitudes a los Endpoints

Los endpoints se encuentran protegidos con credenciales. En el momento de levantar el servidor por primera vez no tendrá un usuario administrador. Puede crear uno con el siguiente comando:

Con el servidor levantado o no aplique el siguiente comando:

```
pnpm create-admin -e <email> -p <password> -n <nombre_usuario>
``` 

**NOTA:** En caso de querer probar los endpoints en el navegador, en la raíz del servidor se encuentra un formulario de autenticación.

# 8. Documentación de la API

La API REST del sistema se encuentra documentada mediante Swagger.

Una vez iniciado el servidor, la documentación se puede acceder desde:

```
http://SOCKET/api/docs
```