/**
 * Clase que formatea la información de un paciente.
 * Se encarga de estructurar los datos recibidos y de prepararlos para ser enviados.
 */
export class PatientDTO {
    constructor(patient) {
        this.name = PatientDTO.capitalize(patient.name);
        this.lastName = PatientDTO.capitalize(patient.lastName);
        this.birth = patient.birth;
        this.typeDNI = patient.typeDNI;
        this.dni = patient.dni;
        this.sex = patient.sex;
        this.address = patient.address;
        this.phone = patient.phone;
        this.email = patient.email?.toLowerCase();
        this.medicalCoverage = patient.medicalCoverage;
        this.nAffiliate = patient.nAffiliate;
        this.observations = patient.observations;
        this.treatments = patient.treatments;
        this.dentalStatus = patient.dentalStatus;
        this.idDoctor = patient.idDoctor;
        this.status = patient.status || 'active';
        this.created = patient.created;
        this.lastChange = patient.lastChange;
    }

    // Helpers de capitalización
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Salida de datos
    static toResponse(patient) {
        return {
            id: patient._id,
            name: patient.name,
            lastName: patient.lastName,
            birth: patient.birth,
            typeDNI: patient.typeDNI,
            dni: patient.dni,
            sex: patient.sex,
            address: patient.address,
            phone: patient.phone,
            email: patient.email,
            medicalCoverage: patient.medicalCoverage,
            nAffiliate: patient.nAffiliate,
            observations: patient.observations,
            treatments: patient.treatments,
            idDoctor: patient.idDoctor,
            status: patient.status,
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
        if (patient.dni) updatedPatient.dni = patient.dni;
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
        if (patient.status) updatedPatient.status = patient.status;
        return updatedPatient;
    }
}

export class CreatePatientDTO {
    constructor(patient) {
        this.name = this.normalize(patient.name);
        this.lastName = this.normalize(patient.lastName);
        this.birth = patient.birth;
        this.typeDNI = patient.typeDNI || 'DNI';
        this.dni = patient.dni;
        this.sex = this.normalizeSex(patient.sex);
        this.address = patient.address;
        this.phone = patient.phone;
        this.email = patient.email?.toLowerCase();
        this.medicalCoverage = patient.medicalCoverage;
        this.nAffiliate = patient.nAffiliate;
        this.observations = patient.observations || [];
        this.treatments = patient.treatments || [];
        this.dentalStatus = patient.dentalStatus || [];
        this.status = patient.status;
        this.idDoctor = patient.idDoctor;
    }

    // Helpers de normalización
    normalize(str){
        return str?.trim().replace(/\s+/g, ' ') || '';
    }

    normalizeEmail(email) {
        return email?.toLowerCase().trim() || ''; 
    }

    normalizeSex(sex) {
        if (!sex) return 'unspecified';
        const validSex = ['male', 'female', 'another', 'unspecified'];
        const sexLower = sex.toLowerCase();
        return validSex.includes(sexLower) ? sexLower : 'unspecified';
    }
}