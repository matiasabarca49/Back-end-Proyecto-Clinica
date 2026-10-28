/**
 * Clase que formatea la información de un doctor.
 * Se encarga de estructurar los datos recibidos y de prepararlos para ser enviados.
 */
export class DoctorDTO {
    constructor(doctor) {
        this._id = doctor.id || doctor._id
        this.name = DoctorDTO.capitalize(doctor.name);
        this.lastName = DoctorDTO.capitalize(doctor.lastName);
        this.dni = doctor.dni;
        this.professionalLicense = doctor.professionalLicense;
        this.email = doctor.email?.toLowerCase();
        this.phone = doctor.phone;
        // ?? y no ||: con || un doctor inactivo (false) quedaría activo
        this.status = doctor.status ?? true
        this.schedules = doctor.schedules || {
            monday: { start: "09:00", end: "18:00" },
            tuesday: { start: "09:00", end: "18:00" },
            wednesday: { start: "14:00", end: "18:00" },
            thursday: { start: "09:00", end: "18:00" },
            friday: { start: "09:00", end: "18:00" },
            saturday: { start: "09:00", end: "18:00" },
        },
        this.color = doctor.color || "#8f897fff";
        this.frequency = doctor.frequency || 30;

    }

    // Helpers de normalización
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Salida de datos
    static toResponse(doctor) {
        return {
            id: doctor._id,
            name: doctor.name,
            lastName: doctor.lastName,
            dni: doctor.dni,
            professionalLicense: doctor.professionalLicense,
            email: doctor.email,
            phone: doctor.phone,
            schedules: doctor.schedules,
            status: doctor.status,
            color: doctor.color,
            frequency: doctor.frequency,
            created: doctor.created,
            lastChange: doctor.lastChange
        };
    }
}

/**
 * DTO de request para actualizar un doctor (PUT /doctors/:id).
 * Solo copia los campos permitidos que vengan en el body: la actualización es parcial.
 * El estado y las fechas de auditoría no se modifican por esta vía.
 * Nombre, apellido y email son datos de la cuenta: se editan por PUT /users/:id,
 * que actualiza usuario y doctor juntos.
 */
export class UpdateDoctorRequestDTO {
    constructor(doctor) {
        if (doctor.dni !== undefined) this.dni = doctor.dni;
        if (doctor.professionalLicense !== undefined) this.professionalLicense = doctor.professionalLicense;
        if (doctor.phone !== undefined) this.phone = doctor.phone;
        if (doctor.schedules !== undefined) this.schedules = doctor.schedules;
        if (doctor.color !== undefined) this.color = doctor.color;
        if (doctor.frequency !== undefined) this.frequency = doctor.frequency;
    }
}

// Para endpoint GET /doctors/:id/schedules
export class DoctorScheduleResponseDTO {
    constructor(doctor) {
        this.id = doctor._id || doctor.id;
        this.name = `${doctor.name} ${doctor.lastName}`;
        this.schedules = doctor.schedules;
        this.color = doctor.color;
        this.frequency = doctor.frequency;
    }
}