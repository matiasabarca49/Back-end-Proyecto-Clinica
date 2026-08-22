# Despliegue con Docker

El proyecto cuenta con tres configuraciones de Docker:

- **Development**: entorno de desarrollo con hot reload mediante `nodemon`.
- **Production**: entorno preparado para ejecutar la aplicación en un ambiente productivo.
- **Services**: Levantar unicamente los servicios necesarios para poder utilizar el sistema.

## Estructura Docker

```text
docker/
├── Dockerfile.dev
├── Dockerfile.prod
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── docker-compose.services.yml
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
DATABASE_URL=mongodb://<localhost o mongo_clinica>:27017/clinica_odontologica
SECRET_SESSIONS=your_secret_sessions_key
PORT=8080
PORT_REDIS=6379
HOST_REDIS=<localhost o redis_clinica>
//========== Autenticación con Google ============
GOOGLE_CLIENT_ID=<ID_GOOGLE>
GOOGLE_CLIENT_SECRET=<SECRETO_GOOGLE>
GOOGLE_CALLBACK_URL= http://<IP_BACKEND o localhost>/api/auth/google/callback 
//========== Envío de Emails ===========
EMAIL_USER=<CORREO_QUE_ENVIARÁ_EMAILS>
EMAIL_PASS=<CLAVE_PARA_APIS>
//========== Servicios ================
PDF_SERVICE_URL=http://<localhost o pdf-service>:8000
```
**NOTA:** No es necesario contar con credenciales de Google ni Emails para probar la API. En caso de no proporcionarlas, la API desactivará esas caracteristicas.

Dentro de Docker los servicios se comunican utilizando el nombre del servicio definido en `docker-compose`.

Ejemplo:

```
mongo_clinica:27017
redis_clinica:6379
```

No se utiliza `localhost` para comunicación entre contenedores.

---

# Despliegue

## Requisitos

- Docker Desktop o Docker Engine
- Docker Compose

## Opcion Services

```
             ┌────────────────────────────┐
             │                            │
             | 2707 ─────► mongo_clinica  │
             │                            │
localhost ─► │ 6379 ─────► redis_clinica  |
             |                            |
             | 8000 ─────► pdf_service    |
             │                            │
             └────────────────────────────┘
```
Ejecucion:

``` 
API Node Local
   │
   ├── localhost:27017 ──► Mongo
   ├── localhost:6379  ──► Redis
   └── localhost:8000  ──► PDF
``` 
**Nota**: En este caso la url de de mongo, redis y pdf-service pueden seguir apuntando al localhost. Asegure de configurar correctamente en el archivo de variables de entorno.

Para levantar únicamente servicios mediante Docker Compose:

Desde la raíz del proyecto ejecutar:

```bash
docker compose -f docker/docker-compose.services.yml up -d
```

## Opcion Desarrollo

```
            Docker Network (bridge)
 ┌───────────────────────────────────────────────┐
 │                                               │
 │   app_clinica  ─────► mongo_clinica           │
 │    |     │                 │                  │
 │    |     └────────► redis_clinica             |
 |    │                                          |
 |    └────────► pdf_service                     |
 │                                               │
 └───────────────────────────────────────────────┘
                 ↑
          localhost:8080
```

Todos viven en la misma red.

### Variables de entorno

El entorno de desarrollo utiliza:


```
docker/.env.development
```
**Nota**: En este caso la url de de mongo, redis y pdf-service deben apuntar al nombre del contenedor.

```
...
DATABASE_URL=mongodb://mongo_clinica:27017/clinica_odontologica
HOST_REDIS=redis_clinica
PDF_SERVICE_URL=http://pdf-service:8000 
...
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

## Opcion Producción

El entorno de producción está diseñado para ofrecer una arquitectura escalable y tolerante a fallos mediante contenedores Docker.

## Arquitectura

La infraestructura está compuesta por los siguientes servicios:

- **Nginx** como reverse proxy y balanceador de carga.
- **2 instancias de la API** Node.js ejecutando la aplicación.
- **MongoDB Replica Set** compuesto por un nodo Primary y dos nodos Secondary.
- **Redis** utilizado para sesiones, caché y colas de trabajo.
- **Prometheus** para la captura y almacenamiento de métricas.
- **Grafana** Análisis y Gráficos de Métricas.

```text
                    Cliente
                       │
                http://localhost
                       │
                Nginx(Round Robin)
                       │
                  ┌─────────┐
                  │         │
            app_node_1    app_node_2
                  │         │
                  └────┬────┘
                       │
                Mongo Replica Set
          ┌─────────────┬───────────────┐
          │             │               │
        Primary     Secondary       Secondary
                        │
                      Redis
```

## Componentes

### Nginx

Nginx actúa como punto de entrada de la aplicación.

Sus responsabilidades son:

- Recibir todas las solicitudes HTTP.
- Distribuir las peticiones entre las distintas instancias de la API.
- Ocultar la infraestructura interna al cliente.
- Permitir futuras configuraciones de HTTPS, compresión, cache y otras funcionalidades.

El balanceo de carga utiliza Sticky Sessions. Una vez que un cliente es enviado a una instancia del backend, intentamos que las siguientes solicitudes de ese cliente vuelvan a esa misma instancia.

### API Node.js

La aplicación se ejecuta en **dos contenedores independientes**.

Ambas instancias comparten:

- La misma base de datos MongoDB.
- El mismo servidor Redis.
- La misma configuración de entorno.

Esto permite distribuir la carga entre múltiples procesos y mantener el servicio disponible si una instancia deja de responder.

### MongoDB Replica Set

La base de datos está configurada como un **Replica Set**, compuesto por tres nodos.

- **Primary**: recibe todas las operaciones de escritura.
- **Secondary 1**: replica los datos del nodo principal.
- **Secondary 2**: replica los datos del nodo principal.

En caso de fallo del nodo Primary, MongoDB realiza automáticamente una nueva elección y promueve uno de los nodos Secondary como nuevo Primary, permitiendo que la aplicación continúe funcionando sin intervención manual.

La aplicación se conecta utilizando la cadena de conexión del Replica Set para que el driver detecte automáticamente los cambios de Primary.

### Redis

Redis es utilizado para:

- Almacenamiento de sesiones.
- Caché de datos.
- Gestión de colas mediante BullMQ.

Todas las instancias de la API utilizan el mismo servidor Redis.

## Balanceo de carga

El tráfico HTTP sigue el siguiente flujo:

```text
Cliente
    │
    ▼
Nginx
    │
    ├────────► API 1
    │
    └────────► API 2
```

Las solicitudes se distribuyen utilizando ip hash, cada cliente tiende a permanecer asociado al mismo backend.

Esto fue actualizado de Roun Robin a Sticky sessionsIP cuando se agregó web sockets. Para permitir que un cliente permanezca asociado al mismo servidor/backend detrás del balanceador.

## Observabilidad

El entorno de producción incorpora Prometheus y Grafana para monitorear el comportamiento del backend.

La arquitectura de observabilidad es:  

```
Node.js API
    │
    │ /api/metrics
    ▼
Prometheus
    │
    │ PromQL
    ▼
Grafana
    │
    ▼
Dashboards
```

### Prometheus

Prometheus se ejecuta como un servicio independiente dentro del Docker Compose de producción.

Su responsabilidad es recolectar y almacenar las métricas expuestas por las instancias del backend.

* Las métricas son expuestas en: **/api/metrics**
* Métricas HTTP y métricas de runtime de la API.
* Prometheus realiza scraping cada 15 segundos.

En producción, Prometheus consulta directamente las instancias del backend mediante la red interna de Docker:  

```
app_node_1:8080
app_node_2:8080  
```  
Configuración de Prometheus:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: clinic-backend
    metrics_path: /api/metrics
    static_configs:
      - targets:
          - "app_node_1:8080"
          - "app_node_2:8080"

```

## Alta disponibilidad

La infraestructura incorpora mecanismos básicos de alta disponibilidad:

- Dos instancias de la API permiten continuar atendiendo solicitudes si una deja de responder.
- MongoDB Replica Set garantiza redundancia de datos y elección automática de un nuevo nodo Primary.
- Redis mantiene la información compartida entre todas las instancias de la aplicación.
- Nginx centraliza el acceso a la infraestructura y distribuye las solicitudes entre las distintas instancias del backend.

### Variables de entorno

El entorno productivo utiliza:

```
docker/.env.production
```

**NOTA:** Las variables son las mismas que en el entorno de desarrollo solo hay que cambiar la url de mongo para que utilice el replica-set.

```
DATABASE_URL=mongodb://mongo_primary:27017,mongo_secondary_1:27017,mongo_secondary_2:27017/clinica_odontologica?replicaSet=rs0
```

---

## Inicio del entorno

Desde la carpeta `docker` ejecutar:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Para detener el entorno:

```bash
docker compose -f docker-compose.prod.yml down
```

Para reconstruir únicamente las instancias de la API:

```bash
docker compose -f docker-compose.prod.yml up -d --build app_node_1 app_node_2
```

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

