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