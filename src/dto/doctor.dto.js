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
        this.status = doctor.status || 'active'
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
            created: doctor.created,
            lastChange: doctor.lastChange
        };
    }

    static toUpdate(doctor) {
        const updatedDoctor = {};
        if (doctor.name) updatedDoctor.name = this.capitalize(doctor.name);
        if (doctor.lastName) updatedDoctor.lastName = this.capitalize(doctor.lastName);
        if (doctor.dni) updatedDoctor.dni = doctor.dni;
        if (doctor.professionalLicense) updatedDoctor.professionalLicense = doctor.professionalLicense;
        if (doctor.email) updatedDoctor.email = doctor.email.toLowerCase();
        if (doctor.phone) updatedDoctor.phone = doctor.phone;
        return updatedDoctor;
    }
}

export class CreateDoctorDTO {
    constructor(doctor) {
        this.name = this.normalize(doctor.name);
        this.lastName = this.normalize(doctor.lastName);
        this.dni = doctor.dni;
        this.professionalLicense = doctor.professionalLicense;
        this.email = this.normalizeEmail(doctor.email);
        this.phone = doctor.phone;
        this.created = doctor.created;
        this.lastChange = doctor.lastChange;
        this.status = doctor.status;
    }

    normalize(str){
        return str?.trim().replace(/\s+/g, ' ') || '';
    }

    normalizeEmail(email) {
        return email?.toLowerCase().trim() || ''; 
    }
}