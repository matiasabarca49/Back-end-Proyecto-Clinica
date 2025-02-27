export class DoctorFormated {
    constructor(doctor) {
        this.name = doctor.name;
        this.lastName = doctor.lastName;
        this.dni = doctor.dni;
        this.professionalLicense = doctor.professionalLicense;
        this.patients = doctor.patients?.map(patient => patient.patientID) || [];
    }

    sendDoctor() {
        return {
            id: this._id,
            name: this.name,
            lastName: this.lastName,
            dni: this.dni,
            professionalLicense: this.professionalLicense,
            patients: this.patients
        };
    }
}

export const sendDoctorFormated = (doctor) => {
    return {
        id: doctor._id,
        name: doctor.name,
        lastName: doctor.lastName,
        dni: doctor.dni,
        professionalLicense: doctor.professionalLicense,
        patients: doctor.patients?.map(patient => patient.patientID) || []
    };
};

export const sendDoctorsFormated = (arrayDoctors) => {
    return arrayDoctors.map(doctor => ({
        id: doctor._id,
        name: doctor.name,
        lastName: doctor.lastName,
        dni: doctor.dni,
        professionalLicense: doctor.professionalLicense,
        patients: doctor.patients?.map(patient => patient.patientID) || []
    }));
};
