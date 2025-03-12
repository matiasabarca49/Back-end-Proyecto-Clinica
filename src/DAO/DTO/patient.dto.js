export class PatientFormated {

    constructor(patient){
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
        this.nAffiliate= patient.nAffiliate;
        this.observations = [];
        this.treatments = [];
        this.appointments = [];
        this.dentalStatus = {
            dientesSupLeft: [],
            dientesSupRight: [],
            dientesInfLeft: [],
            dientesInfRight: []
        }
    }

    sendPatient(){
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
        }
    }
}

export const sendPatientFormated = (patient) =>{
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
    }
}

export const sendPatientsFormated = (arrayPatients) =>{
    const arrayMaped = arrayPatients.map( patient => {
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
        }
    })
    return arrayMaped;
}
