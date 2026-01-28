/**
 * Clase que formatea la información de un paciente.
 * Se encarga de estructurar los datos recibidos y de prepararlos para ser enviados.
 */
export class PatientFormated {

    /**
     * Constructor de la clase.
     * @param {Object} patient Objeto paciente con los datos a formatear.
     */
    constructor(patient) {
        this.name = patient.name;
        this.lastName = patient.lastName;
        this.birth = patient.birth;
        this.typeDNI = patient.typeDNI;
        this.DNI = patient.DNI;
        this.sex = patient.sex;
        this.address = patient.address;
        this.phone = patient.phone;
        this.email = patient.email;
        this.medicalCoverage = patient.medicalCoverage;
        this.nAffiliate = patient.nAffiliate;
        this.observations = [];
        this.treatments = [];
        this.dentalStatus = {
            dientesSupLeft: [],
            dientesSupRight: [],
            dientesInfLeft: [],
            dientesInfRight: []
        },
        this.idDoctor = patient.idDoctor
    }

    /**
     * Método para devolver el objeto paciente formateado.
     * @returns {Object} Objeto con los datos del paciente en formato estructurado.
     */
    sendPatient() {
        return {
            id: this._id,
            name: this.name,
            lastName: this.lastName,
            birth: this.birth,
            typeDNI: this.typeDNI,
            DNI: this.DNI,
            sex: this.sex,
            address: this.address,
            phone: this.phone,
            email: this.email,
            medicalCoverage: this.medicalCoverage,
            nAffiliate: this.nAffiliate,
            observations: this.observations,
            treatments: this.treatments,
            dentalStatus: this.dentalStatus,
            idDoctor: this.idDoctor
        };
    }
}

/**
 * Función que recibe un paciente y devuelve sus datos formateados.
 * @param {Object} patient Objeto paciente con los datos a formatear.
 * @returns {Object} Objeto con los datos del paciente en formato estructurado.
 */
export const sendPatientFormated = (patient) => {
    return {
        id: patient._id,
        name: patient.name,
        lastName: patient.lastName,
        birth: patient.birth,
        typeDNI: patient.typeDNI,
        DNI: patient.DNI,
        sex: patient.sex,
        address: patient.address,
        phone: patient.phone,
        email: patient.email,
        medicalCoverage: patient.medicalCoverage,
        nAffiliate: patient.nAffiliate,
        observations: patient.observations,
        treatments: patient.treatments,
        dentalStatus: patient.dentalStatus,
        idDoctor: patient.idDoctor
    };
};

/**
 * Función que recibe un arreglo de pacientes y devuelve un arreglo con los datos de cada uno formateados.
 * @param {Array} arrayPatients Arreglo de objetos pacientes a formatear.
 * @returns {Array} Arreglo con los datos de los pacientes en formato estructurado.
 */
export const sendPatientsFormated = (arrayPatients) => {
    const arrayMaped = arrayPatients.map(patient => {
        return {
            id: patient._id,
            name: patient.name,
            lastName: patient.lastName,
            birth: patient.birth,
            typeDNI: patient.typeDNI,
            DNI: patient.DNI,
            sex: patient.sex,
            address: patient.address,
            phone: patient.phone,
            email: patient.email,
            medicalCoverage: patient.medicalCoverage,
            nAffiliate: patient.nAffiliate,
            idDoctor: patient.idDoctor
        };
    });
    return arrayMaped;
};

// ============================================
// NUEVOS DTOs (patrón moderno)
// ============================================

export class PatientDTO {
    constructor(patient) {
        this.name = PatientDTO.capitalize(patient.name);
        this.lastName = PatientDTO.capitalize(patient.lastName);
        this.birth = patient.birth;
        this.typeDNI = patient.typeDNI || 'DNI';
        this.DNI = patient.DNI;
        this.sex = this.normalizeSex(patient.sex);
        this.address = patient.address;
        this.phone = patient.phone;
        this.email = patient.email?.toLowerCase();
        this.medicalCoverage = patient.medicalCoverage;
        this.nAffiliate = patient.nAffiliate;
        this.observations = patient.observations || [];
        this.treatments = patient.treatments || [];
        this.dentalStatus = patient.dentalStatus || {
            dientesSupLeft: [],
            dientesSupRight: [],
            dientesInfLeft: [],
            dientesInfRight: []
        };
        this.idDoctor = patient.idDoctor;
        this.created = patient.created;
        this.lastChange = patient.lastChange;
    }

    // Helpers de normalización
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    normalizeSex(sex) {
        if (!sex) return '';
        const validSex = ['masculino', 'femenino', 'otro'];
        const sexLower = sex.toLowerCase();
        return validSex.includes(sexLower) ? sexLower : '';
    }

    // Salida de datos
    static toResponse(patient) {
        return {
            id: patient._id,
            name: patient.name,
            lastName: patient.lastName,
            birth: patient.birth,
            typeDNI: patient.typeDNI,
            DNI: patient.DNI,
            sex: patient.sex,
            address: patient.address,
            phone: patient.phone,
            email: patient.email,
            medicalCoverage: patient.medicalCoverage,
            nAffiliate: patient.nAffiliate,
            observations: patient.observations,
            treatments: patient.treatments,
            dentalStatus: patient.dentalStatus,
            idDoctor: patient.idDoctor,
            created: patient.created,
            lastChange: patient.lastChange
        };
    }

    static toUpdate(patient) {
        const updatedPatient = {};
        if (patient.name) updatedPatient.name = this.capitalize(patient.name);
        if (patient.lastName) updatedPatient.lastName = this.capitalize(patient.lastName);
        if (patient.birth) updatedPatient.birth = patient.birth;
        if (patient.typeDNI) updatedPatient.typeDNI = patient.typeDNI;
        if (patient.DNI) updatedPatient.DNI = patient.DNI;
        if (patient.sex) updatedPatient.sex = patient.sex.toLowerCase();
        if (patient.address) updatedPatient.address = patient.address;
        if (patient.phone) updatedPatient.phone = patient.phone;
        if (patient.email) updatedPatient.email = patient.email.toLowerCase();
        if (patient.medicalCoverage) updatedPatient.medicalCoverage = patient.medicalCoverage;
        if (patient.nAffiliate) updatedPatient.nAffiliate = patient.nAffiliate;
        if (patient.observations) updatedPatient.observations = patient.observations;
        if (patient.treatments) updatedPatient.treatments = patient.treatments;
        if (patient.dentalStatus) updatedPatient.dentalStatus = patient.dentalStatus;
        if (patient.idDoctor) updatedPatient.idDoctor = patient.idDoctor;
        return updatedPatient;
    }
}

export class CreatePatientDTO {
    constructor(patient) {
        this.name = this.normalizeName(patient.name);
        this.lastName = this.normalizeName(patient.lastName);
        this.birth = patient.birth;
        this.typeDNI = patient.typeDNI || 'DNI';
        this.DNI = patient.DNI;
        this.sex = this.normalizeSex(patient.sex);
        this.address = patient.address;
        this.phone = patient.phone;
        this.email = patient.email?.toLowerCase();
        this.medicalCoverage = patient.medicalCoverage;
        this.nAffiliate = patient.nAffiliate;
        this.observations = patient.observations || [];
        this.treatments = patient.treatments || [];
        this.dentalStatus = patient.dentalStatus || {
            dientesSupLeft: [],
            dientesSupRight: [],
            dientesInfLeft: [],
            dientesInfRight: []
        };
        this.idDoctor = patient.idDoctor;
        this.created = patient.created;
        this.lastChange = patient.lastChange;
    }

    normalizeName(name) {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    normalizeSex(sex) {
        if (!sex) return '';
        const validSex = ['masculino', 'femenino', 'otro'];
        const sexLower = sex.toLowerCase();
        return validSex.includes(sexLower) ? sexLower : '';
    }
}