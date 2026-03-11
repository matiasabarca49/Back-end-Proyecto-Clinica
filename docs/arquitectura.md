# Arquitectura del Sistema

## 1. Introducción

Este proyecto corresponde a un **Sistema de Gestión para Clínica Odontológica**, cuyo objetivo es administrar información relacionada con pacientes, doctores, turnos e historias clínicas odontológicas.

El sistema fue diseñado utilizando una **arquitectura monolítica basada en capas**, permitiendo organizar la lógica del sistema de forma clara y mantenible.

---

## 2. Arquitectura General

El sistema sigue una arquitectura **monolítica**, donde todas las funcionalidades del backend se ejecutan dentro de una misma aplicación.

La aplicación expone una **API REST** consumida por el frontend.

Flujo general:

Frontend → API REST → Lógica de negocio → Base de datos

---

## 3. Arquitectura por Capas

El backend está organizado siguiendo el patrón **MVC (Model - View - Controller)** junto con una separación adicional en capas para mantener el desacoplamiento entre componentes.

Estructura de capas:

Controller → Service → Repository → Model → Database

### 3.1 - Controller

Responsabilidades:

- recibir solicitudes HTTP
- validar datos de entrada
- invocar la lógica de negocio
- devolver respuestas al cliente

Los controladores no contienen lógica de negocio.

---

### 3.2 - Service

Responsabilidades:

- implementar la lógica de negocio del sistema
- coordinar operaciones entre distintos componentes
- aplicar reglas del dominio

Esta capa actúa como intermediaria entre los controladores y el acceso a datos.

---

### 3.3 - Repository

Responsabilidades:

- encapsular el acceso a la base de datos
- ejecutar consultas
- interactuar con los modelos de persistencia

Esto permite aislar la lógica de acceso a datos del resto del sistema.

---

### 3.4 - Model

Los modelos representan las **entidades del sistema** y definen la estructura de los datos almacenados en la base de datos.

Los modelos se definen utilizando **Mongoose**, permitiendo mapear documentos de MongoDB a objetos de JavaScript.

---

### 3.5 - DTO (Data Transfer Object)

Los **DTO** se utilizan para definir las estructuras de datos que se envían o reciben a través de la API.

Su uso permite:

- evitar exponer directamente los modelos de base de datos
- controlar qué información se envía al cliente
- mantener separación entre capa de persistencia y capa de presentación.

---

## 3.6 - Persistencia de Datos

El sistema utiliza **MongoDB** como base de datos.

Características:

- base de datos NoSQL documental
- almacenamiento basado en documentos JSON
- flexible para representar estructuras complejas como historias clínicas odontológicas

La comunicación con la base de datos se realiza mediante ODM **Mongoose**.

---

## 4. Autenticación y Seguridad

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación de usuarios.

Proceso:

1. El usuario envía sus credenciales al endpoint de login
2. El servidor valida las credenciales
3. Se genera un token JWT
4. El token se almacena en una cookie segura
5. En cada request posterior el servidor valida el token para autorizar el acceso a recursos protegidos

---

## 5. Infraestructura

El sistema es stateless permitiendo poder ejecutarse en entornos contenerizados mediante:

- **Docker**
- **Kubernetes**

Esto permite facilitar el despliegue, la portabilidad y la escalabilidad de la aplicación.

---

## 6. Beneficios de esta arquitectura

El uso de una arquitectura monolítica por capas permite:

- simplicidad en el desarrollo
- menor complejidad operativa
- organización clara del código
- facilidad de mantenimiento
- evolución futura hacia microservicios si fuera necesario