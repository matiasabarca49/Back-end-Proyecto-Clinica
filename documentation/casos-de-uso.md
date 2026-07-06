# Casos de Uso

## 1. Introducción

Este documento describe los principales **casos de uso del sistema de gestión para clínica odontológica**.

Los casos de uso representan las acciones que los usuarios pueden realizar dentro del sistema y describen la interacción entre los actores y el sistema.

---

# 2. Actores del Sistema

Los actores principales que interactúan con el sistema son:

- **Administrador**
- **Empleado(Recepcionista)**
- **Doctor**

---

# 3. Casos de Uso Principales

Los principales casos de uso del sistema incluyen:

- Autenticación de usuario
- Registro de pacientes
- Consulta de historia clínica
- Actualización del odontograma
- Gestión de turnos

**NOTA:** Se agregarán más casos de uso en el Futuro.

---

# 3.1 - Caso de Uso: Autenticación de Usuario

Actor: Usuario del sistema

Descripción:  
Permite a un usuario autenticarse en el sistema para acceder a funcionalidades protegidas.

Flujo principal:

1. El usuario ingresa su correo electrónico y contraseña.
2. El sistema valida las credenciales.
3. El sistema genera un token JWT.
4. El token se almacena en una cookie segura.
5. El usuario accede al sistema.
6. La cookie almacenada en el usuario se envía en cada solicitud.

Resultado esperado:

El usuario queda autenticado y puede acceder a los recursos permitidos según su rol.

---

# 3.2 - Caso de Uso: Registrar Paciente

Actor: Empleado

Descripción:  
Permite registrar un nuevo paciente en el sistema.

Flujo principal:

1. El usuario accede al módulo de pacientes.
2. Selecciona la opción "Registrar paciente".
3. Ingresa los datos personales del paciente.
4. El sistema valida la información ingresada.
5. El sistema crea el registro del paciente.

Resultado esperado:

El paciente queda registrado en el sistema con su historia clínica asociada.

---

# 3.3 - Caso de Uso: Consultar Historia Clínica

Actor: Doctor

Descripción:  
Permite consultar la información clínica de un paciente.

Flujo principal:

1. El usuario busca un paciente.
2. El sistema muestra los datos del paciente.
3. El sistema muestra el odontograma y la información clínica.

Resultado esperado:

El doctor puede visualizar el estado actual de la historia clínica del paciente.

---

# 3.4 - Caso de Uso: Actualizar Odontograma

Actor: Doctor

Descripción:  
Permite actualizar el estado de los dientes en el odontograma.

Flujo principal:

1. El doctor accede a la historia clínica del paciente.
2. Selecciona un diente.
3. Modifica el estado de una o más superficies.
4. El sistema guarda los cambios en la base de datos.

Resultado esperado:

El odontograma se actualiza reflejando el estado actual del tratamiento.

---

# 8. Caso de Uso: Gestionar Turnos

Actor: Empleado

Descripción:  
Permite asignar turnos entre pacientes y doctores.

Flujo principal:

1. El usuario accede al módulo de turnos.
2. Selecciona paciente y doctor.
3. Define fecha y hora del turno.
4. El sistema guarda el turno.

Resultado esperado:

El turno queda registrado y asociado al paciente y al doctor.
