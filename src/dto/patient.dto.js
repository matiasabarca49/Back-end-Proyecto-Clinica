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
        this.appointments = [];
        this.dentalStatus = {
            dientesSupLeft: [],
            dientesSupRight: [],
            dientesInfLeft: [],
            dientesInfRight: []
        };
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
            appointments: this.appointments,
            dentalStatus: this.dentalStatus
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
        appointments: patient.appointments,
        dentalStatus: patient.dentalStatus
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
        };
    });
    return arrayMaped;
};
