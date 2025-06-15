# Repositorio Back-End Proyecto Clínica

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

## Instalación y puesta en marcha
###### Requisitos para la instalación:

- **Node.js** Entorno de ejecucion.
- **NPM** Para instalar las librerías necesarias
- **Terminal Linux/cmd Windows** Para su instalación

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

Para instalar las librerias necesarias, ingresamos al directorio una vez realizada la descompresión del ZIP y ejecutamos el siguiente comando:
```
npm install
```
Es necesario tener instalado nodemon para poder ejecutar la aplicación. Esta herramienta nos permite reiniciar la aplicacion cada vez que se guardan los cambios. Para instalar:

```
npm install nodemon
```

Una vez instalados todas las libreriasa necesarias, ejecutamos la aplicacion con el siguiente comando:

```
npm start
```

Con "npm start" el servidor iniciará en modo desarrollo y el puerto utilizado será el "8080". Las opciones que pude establecer son:

## Acceso

El acceso se realiza mediante el navegador. 

 - En local a través de la dirección -> http://localhost:8080