export class PatientFormated {

    constructor(patient){
        this.name = patient.name;
        this.lastName = patient.lastName;
        this.birth = patient.birth;
        this.typeDNI = patient.typeDNI;
        this.DNI = patient.email;
        this.sex = patient.sex;
        this.address = patient.address;
        this.phone = patient.address;
        this.email = patient.email;
        this.medicalCoverage = patient.medicalCoverage;
        this.nAffiliate= patient.nAffiliate;
        this.observations = [];
        this.treatments = [];
        this.appointments = [];
        this.dentalStatus = {
            dientesSupLeft: [
                {tooth: 18, status: "H"},
                {tooth: 17, status: "H"},
                {tooth: 16, status: "H"},
                {tooth: 15, status: "H"},
                {tooth: 14, status: "H"},
                {tooth: 13, status: "H"},
                {tooth: 12, status: "H"},
                {tooth: 11, status: "H"},
                {tooth: 48, status: "H"},
                {tooth: 47, status: "H"},
                {tooth: 46, status: "H"},
                {tooth: 45, status: "H"},
                {tooth: 44, status: "H"},
                {tooth: 43, status: "H"},
                {tooth: 42, status: "H"},
                {tooth: 41, status: "H"}
              ],
            dientesSupRight: [
                { tooth: 21, status: "H" },
                { tooth: 22, status: "H" },
                { tooth: 23, status: "H" },
                { tooth: 24, status: "H" },
                { tooth: 25, status: "H" },
                { tooth: 26, status: "H" },
                { tooth: 27, status: "H" },
                { tooth: 28, status: "H" },
                { tooth: 31, status: "H" },
                { tooth: 32, status: "H" },
                { tooth: 33, status: "H" },
                { tooth: 34, status: "H" },
                { tooth: 35, status: "H" },
                { tooth: 36, status: "H" },
                { tooth: 37, status: "H" },
                { tooth: 38, status: "H" }
              ],
            dientesInfLeft: [
                { tooth: 55, status: "H" },
                { tooth: 54, status: "H" },
                { tooth: 53, status: "H" },
                { tooth: 52, status: "H" },
                { tooth: 51, status: "H" },
                { tooth: 85, status: "H" },
                { tooth: 84, status: "H" },
                { tooth: 83, status: "H" },
                { tooth: 82, status: "H" },
                { tooth: 81, status: "H" }
              ],
            dientesInfRight: [
                { tooth: 61, status: "H" },
                { tooth: 62, status: "H" },
                { tooth: 63, status: "H" },
                { tooth: 64, status: "H" },
                { tooth: 65, status: "H" },
                { tooth: 71, status: "H" },
                { tooth: 72, status: "H" },
                { tooth: 73, status: "H" },
                { tooth: 74, status: "H" },
                { tooth: 75, status: "H" }
              ]
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
