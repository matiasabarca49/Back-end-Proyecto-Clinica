# Despliegue con Docker

El proyecto cuenta con dos configuraciones de Docker:

- **Development**: entorno de desarrollo con hot reload mediante `nodemon`.
- **Production**: entorno preparado para ejecutar la aplicación en un ambiente productivo.

## Estructura Docker

```text
docker/
├── Dockerfile.dev
├── Dockerfile.prod
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.development
└── .env.production
```

**NOTA:** Debe crear el archivo de variables de entorno manualmente

---

## Variables de entorno

Ejemplo:

```env
NODE_ENV=development
ORIGIN_FRONTEND=<URL_FRONTEND>
DATABASE_URL=mongodb://mongo_clinica:27017/clinica_odontologica
SECRET_SESSIONS=your_secret_sessions_key
PORT=8080
PORT_REDIS=6379
HOST_REDIS=redis_clinica
//========== Autenticación con Google ============
GOOGLE_CLIENT_ID=<ID_GOOGLE>
GOOGLE_CLIENT_SECRET=<SECRETO_GOOGLE>
GOOGLE_CALLBACK_URL= http://<IP_BACKEND o localhost>/api/auth/google/callback 
//========== Envío de Emails ===========
EMAIL_USER=<CORREO_QUE_ENVIARÁ_EMAILS>
EMAIL_PASS=<CLAVE_PARA_APIS>
```

Dentro de Docker los servicios se comunican utilizando el nombre del servicio definido en `docker-compose`.

Ejemplo:

```
mongo_clinica:27017
redis_clinica:6379
```

No se utiliza `localhost` para comunicación entre contenedores.

---

# Despliegue

## Desarrollo

### Requisitos

- Docker Desktop o Docker Engine
- Docker Compose

El entorno de desarrollo utiliza:

### Variables de entorno

```
docker/.env.development
```

### Levantar el entorno

Desde la raíz del proyecto ejecutar:

```bash
docker compose -f docker/docker-compose.dev.yml up --build
```

La primera vez se utiliza `--build` para crear la imagen.

En ejecuciones posteriores:

```bash
docker compose -f docker/docker-compose.dev.yml up
```

---

### Características del entorno de desarrollo

El entorno utiliza:

- Node.js dentro de Docker.
- MongoDB como base de datos.
- Redis para manejo de sesiones/cache.
- Nodemon para reinicio automático.
- Volúmenes para sincronizar el código fuente.

El código local se monta dentro del contenedor:

```yaml
volumes:
  - ..:/app
  - /app/node_modules
```

Esto permite modificar archivos del proyecto sin reconstruir la imagen.

Flujo:

```
Modificar código -> Volumen sincroniza cambios -> Nodemon detecta cambios -> Reinicia aplicación
```

---

## Producción

### Variables de entorno

El entorno productivo utiliza:

```
docker/.env.production
```

NOTA: Las variables son las mismas que en el entorno de desarrollo. 

Desde la raíz del proyecto:

```bash
docker compose -f docker/docker-compose.prod.yml up --build
```

---

### Características del entorno de producción

La imagen de producción:

- Instala únicamente dependencias necesarias.
- No utiliza nodemon.
- Ejecuta directamente Node.js.
- Mantiene el código dentro de la imagen.
- Utiliza variables de entorno de producción.

Ejemplo de ejecución:

```dockerfile
CMD ["node", "src/server.js"]
```

---

# Servicios utilizados

Ambos entornos levantan los siguientes servicios:

## Backend Node.js

Puerto expuesto:

```
8080
```

---

## MongoDB

Servicio:

```
mongo_clinica
```

Puerto:

```
27017
```

Persistencia mediante volumen:

```
mongo_clinica_data
```

---

## Redis

Servicio:

```
redis_clinica
```

Puerto interno:

```
6379
```

Persistencia mediante volumen:

```
redis_data
```

---

# Comandos útiles

## Ver contenedores activos

```bash
docker ps
```

## Ver logs

Todos los servicios:

```bash
docker compose logs -f
```

Solo backend:

```bash
docker compose logs -f app_node_1
```

## Entrar a un contenedor

```bash
docker exec -it <ID_CONTENEDOR> sh
```

## Detener entorno

```bash
docker compose down
```

## Reconstruir imágenes

Utilizar cuando cambien:

- Dockerfile.
- Dependencias.
- Package-lock.

```bash
docker compose up --build
```

