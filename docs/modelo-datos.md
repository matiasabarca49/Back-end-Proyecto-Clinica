# Modelo de Datos

## 1. Introducción

El sistema utiliza **MongoDB** como base de datos documental.

Las entidades se modelan mediante **documentos JSON** utilizando **Mongoose**.  
Esto permite representar estructuras complejas de manera flexible, como la historia clínica odontológica de un paciente.

En este sistema, la **historia clínica se encuentra representada en los documentos de la colección Pacientes**, donde cada documento contiene toda la información médica y odontológica asociada a cada Paciente.

---

# 2. Entidades Principales

Las principales colecciones del sistema son:

- Patients(Pacientes)
- Doctors(Odontólogos)
- Users(Usuarios del sistema)
- Appointments(Turnos)

---

# 3. Patient (Historia Clínica)

La colección **Patients** representa la historia clínica completa de un paciente.

Contiene:

- Datos personales
- Información de contacto
- Odontograma
- Información clínica relevante

Ejemplo de estructura:

```json
{
  "_id": "698d061eb163b390a1203604",
  "name": "Juan",
  "lastName": "Perez",
  "birth": "2000-06-22",
  "typeDNI": "DNI",
  "dni": "1435335",
  "sex": "male",
  "address": "San Marti 335",
  "phone": "34567457",
  "email": "juan@correo.com",
  "medicalCoverage": "NombreCobertura",
  "nAffiliate": "12321",
  "treatments": [],
  "observations": [],
  "dentalStatus": ["Esquema Odontrograma"],
  "status": "active",
  "idDoctor": "698bc69b8de2f1225c93db1f",
  "created": "date",
  "lastChange": "date",
}
```
# 3.1 odontograma

El odontograma representa el estado de los dientes del paciente.

Se encuentra embebido dentro del documento Patient.

Cada diente contiene información sobre el estado de sus superficies.

```json
{
    "tooth": 35,
    "caries": {
        "vestibular": "1",
        "mesial": "2",
        "oclusal": "0",
        "distal": "0",
        "lingual": "0"
    },
    "corona": false,
    "extracted": false,
    "allcaries": false,
    "incurable": false,
    "malposition": false,
    "periodontal": false,
    "inscrustration": false
}
```
| Valor | Significado |
| ----- | ----------- |
| 0     | Sano        |
| 1     | Cariado     |
| 2     | Obturado    |

# 4. Doctor

Representa a los profesionales que trabajan en la clínica.

```json
{
  "_id": "69b1c1d50a5a71cd170b8ea5",
  "name": "Alfonso",
  "lastName": "Dupran",
  "dni": "34556432",
  "phone": "2617564834",
  "email": "alfonso@correo.com",
  "professionalLicense": "456443",
  "schedules": {
    "monday": {
      "start": "09:00",
      "end": "18:00"
    },
    "tuesday": {
      "start": "09:00",
      "end": "18:00"
    },
    "wednesday": {
      "start": "14:00",
      "end": "18:00"
    },
    "thursday": {
      "start": "09:00",
      "end": "18:00"
    },
    "friday": {
      "start": "09:00",
      "end": "18:00"
    },
    "saturday": {
      "start": "09:00",
      "end": "18:00"
    }
  },
  "status": "active",
  "color": "#1f3aa8",
  "created": "date",
  "lastChange": "date"
}
```

# 5. User 

Representa los usuarios que pueden acceder al sistema.


```json
{
  "_id": "698a0f4baa5e694290340bfe",
  "name": "Horacio",
  "lastName": "Radi",
  "email": "horacio@correo.com",
  "password": "$2b$10$IVjbqkuteWiZwU9mbvlgC.aTVAo6kwiNrjdbhTL19zTWH/LMV3u3.",
  "rol": "employee",
  "status": "active",
  "lastLogintAt": "date",
  "mustChangePassword": true,
  "passwordChangedAt": null,
  "passwordHistory": [],
  "created": "date",
  "lastChange": "date",
}

```

Roles posibles:

- admin

- employee

- doctor

# 6. Appointment(Turnos)

Representa los turnos asignados entre pacientes y doctores.

```json
{
  "_id": "699e3d33e1d5d098de4002d7",
  "date": "date",
  "slots": [3],
  "typeAppointment": "consulta",
  "room": "Consultorio 1",
  "doctorID": "698bc69b8de2f1225c93db1f",
  "patientID": "699e377f783618c8fb31b2db",
  "status": "confirmed",
  "observations": "",
  "created": "date",
  "lastChange": "date"
}
```

Estados posibles:

- pending  
- confirmed  
- noshow  
- rescheduled  
- finalized  
- canceled

# 7. Relaciones

Relaciones principales:

Patient      1 --- N   Appointment  
Appointment  1 --- 1   Patient

Doctor       1 --- N   Appointment  
Appointment  1 --- 1   Doctor

Cada turno referencia:

- un paciente

- un doctor

**El odontograma forma parte del documento Patient, por lo que no se modela como una entidad independiente.**

