# Repositorio Back-End – Sistema de Gestión para Clínica Odontológica

Backend de una aplicación web para la gestión integral de una clínica odontológica, desarrollado con Node.js, Express, Javascript y MongoDB.

**Nota:** El frontend no es público. Si desea evaluar el proyecto completo, puede solicitar una demostración o una muestra del frontend.

## Funcionalidades principales

El sistema permite gestionar:

- Autenticación y autorización de usuarios.
- Gestión de pacientes.
- Gestión de profesionales y sus horarios de atención.
- Gestión de turnos con control de disponibilidad y seguimiento con calendario.
- Historia clínica digital con odontograma.
- Administración de usuarios del sistema.

## Características principales

- **Autenticación local y de terceros** para ofrecer diferentes métodos de inicio de sesión.
- **Gestión de sesiones y caché** para optimizar el rendimiento de la aplicación.
- **Procesamiento de tareas en segundo plano** para ejecutar operaciones asíncronas.
- **Búsqueda automática del próximo turno disponible** según la agenda de cada profesional.
- **Documentación interactiva de la API** para facilitar el desarrollo y las integraciones.
- **Arquitectura por capas y stateless** para favorecer la escalabilidad y el mantenimiento del sistema.

## Tecnologías

- Node.js
- Express
- JavaScript
- MongoDB
- Redis
- BullMQ
- JWT
- Passport.js
- Swagger / OpenAPI

## Arquitectura

El proyecto sigue una arquitectura por capas para separar responsabilidades y facilitar el mantenimiento.

```text
Router -> Controller -> Service -> Repository -> DB
```

---

## Estructura del proyecto

```
src/
├── cache/          # Configuración de servicios que manejan el cache
├── config/         # Configuración general del sistema
├── controllers/    # Manejo de requests y responses HTTP
├── docs/           # Documentación endpoints swagger
├── dto/            # Transferencia y normalización de datos
├── exceptions/     # Excepciones personalizadas
├── middlewares/    # Middlewares de Express
├── model/          # Definiciones relacionadas a persistencia
├── public/         # Recursos estáticos
├── queue/          # Gestión de colas y procesamiento asíncrono
├── repositories/   # Acceso a datos
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio
├── utils/          # utilidades para el código
├── validation/     # Validaciones de entrada
├── workers/        # Procesamiento de tareas en segundo plano
├── app.js
└── server.js
```

## Documentación

Para obtener información detallada sobre el proyecto, consulte la documentación disponible en la carpeta `documentation`:

- [Arquitectura](documentation/arquitectura.md)
- [Modelo de datos](documentation/modelo-datos.md)
- [Casos de uso](documentation/casos-de-uso.md)
- [Instalación y configuración](documentation/instalacion.md)
- [Despliegue con Docker](documentation/despliegue-docker.md)

# Trabajo del equipo

## Estructuras Ramas:

### 1 - main
* Código listo para producción.
* Cambios completamente testeados y aprobados.
* Ramas para despliegues.

### 2 - development
* Rama donde se realiza el desarrollo activo.
* Se integran las nuevas características, correcciones de bugs y otros cambios antes de pasar a _main_.

### 3 - feature branches
*   Se crean ramas cortas para características específicas **(feature/nueva-funcionalidad)**, correcciones **(fix/error-crítico)**.
*   Ramas que se fusionan a _development_

## Flujo de Trabajo

### 1 - Desarrollo Constante

* Se trabaja en pequeñas ramas temporales basadas en _development_
* Al completar una tarea, la rama se fusiona en _development_ 

### 2 - Pruebas
* Se prueban los cambios integrados en development

### 3 - Preparación para Producción
* Cuando los cambios en development están listos y estables, se fusionan en _main_.

# Instalación y puesta en marcha

**NOTA**: Existe la opcion de desplegar con docker -> [Ver documentacion Docker](documentation/despliegue-docker.md)

###### Requisitos para la instalación:

- **Node.js** Entorno de ejecucion.
- **NPM** Para instalar las librerías necesarias
- **Terminal Linux/cmd Windows** Para su instalación
- **Servidor Redis** Para su ejecución

Node.js se puede descargar de su página oficial -> https://nodejs.org/en
El paquete de instalación de Node.js tambien instala la herramienta **npm**

En linux se puede instalar mediante la ejecución del comando:

```
sudo apt install nodejs
```

Para descargar la ultima version de npm, en una terminal podemos ejecutar:

```
npm install -g npm
npm install -g npm@latest
```
NOTA: Es posible que se requiera permisos de administrador para ejecutar los comandos anteriores

## Descarga o clonación del repositorio

Se puede descargar desde el propio Github en el apartado -> code-> Donwload ZIP o mediante el comando de clonación en una terminal:

```
git clone https://github.com/matiasabarca49/Back-end-Proyecto-Clinica.git
```

## Instalación

Para su instalación consultar el documento -> [Instalación y configuración](documentation/instalacion.md)

## Acceso

El acceso se realiza mediante el navegador. 

 - En local a través de la dirección -> http://localhost:8080

## Licencia

Este proyecto se encuentra bajo la licencia MIT.

Esto significa que el código puede ser utilizado, modificado y distribuido libremente,
siempre que se mantenga el aviso de copyright original.

Ver archivo LICENSE para más información.