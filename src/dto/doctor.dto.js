/**
 * Clase que formatea la información de un doctor.
 * Se encarga de estructurar los datos recibidos y de prepararlos para ser enviados.
 */
export class DoctorFormated {
    /**
     * Constructor de la clase.
     * @param {Object} doctor Objeto doctor con los datos a formatear.
     */
    constructor(doctor) {
        this._id = doctor.id || doctor._id
        this.name = doctor.name;
        this.lastName = doctor.lastName;
        this.dni = doctor.dni;
        this.professionalLicense = doctor.professionalLicense;
        this.email = doctor.email;
        this.phone = doctor.phone;
    }

    /**
     * Método para devolver el objeto doctor formateado.
     * @returns {Object} Objeto con los datos del doctor en formato estructurado.
     */

    sendDoctor() {
        return {
            id: this._id || this.id,
            name: this.name,
            lastName: this.lastName,
            dni: this.dni,
            professionalLicense: this.professionalLicense,
            email: this.email,
            phone: this.phone
        };
    }
}

/**
 * Función que recibe un doctor y devuelve sus datos formateados.
 * @param {Object} doctor Objeto doctor con los datos a formatear.
 * @returns {Object} Objeto con los datos del doctor en formato estructurado.
 */
export const sendDoctorFormated = (doctor) => {
    return {
        id: doctor._id || doctor.id,
        name: doctor.name,
        lastName: doctor.lastName,
        dni: doctor.dni,
        professionalLicense: doctor.professionalLicense,
        email: doctor.email,
        phone: doctor.phone
    };
};

/**
 * Función que recibe un arreglo de doctores y devuelve un arreglo con los datos de cada uno formateados.
 * @param {Array} arrayDoctors Arreglo de objetos doctores a formatear.
 * @returns {Array} Arreglo con los datos de los doctores en formato estructurado.
 */
export const sendDoctorsFormated = (arrayDoctors) => {
    const arrayMaped = arrayDoctors.map(doctor => {
        return{
            id: doctor._id,
            name: doctor.name,
            lastName: doctor.lastName,
            dni: doctor.dni,
            professionalLicense: doctor.professionalLicense,
            email: doctor.email,
            phone: doctor.phone
        }
    })
    return arrayMaped;
};

// ============================================
// NUEVOS DTOs (patrón moderno)
// ============================================

export class DoctorDTO {
    constructor(doctor) {
        this.name = DoctorDTO.capitalize(doctor.name);
        this.lastName = DoctorDTO.capitalize(doctor.lastName);
        this.dni = doctor.dni;
        this.professionalLicense = doctor.professionalLicense;
        this.email = doctor.email?.toLowerCase();
        this.phone = doctor.phone;
        this.created = doctor.created;
        this.lastChange = doctor.lastChange;
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
        this.name = this.normalizeName(doctor.name);
        this.lastName = this.normalizeName(doctor.lastName);
        this.dni = doctor.dni;
        this.professionalLicense = doctor.professionalLicense;
        this.email = doctor.email?.toLowerCase();
        this.phone = doctor.phone;
        this.created = doctor.created;
        this.lastChange = doctor.lastChange;
    }

    normalizeName(name) {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
}