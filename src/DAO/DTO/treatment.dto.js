export class TreatmentFormated {
    constructor(treatment) {
        this.name = treatment.name;
        this.dateStart = treatment.dateStart;
        this.dateEnd = treatment.dateEnd;
        this.status = treatment.status;
        this.idPatient = treatment.idPatient;
        this.idDoctor = treatment.idDoctor;
    }

    sendTreatment() {
        return {
            id: this._id,
            name: this.name,
            dateStart: this.dateStart,
            dateEnd: this.dateEnd,
            status: this.status,
            idPatient: this.idPatient,
            idDoctor: this.idDoctor
        };
    }
}

export const sendTreatmentFormated = (treatment) => {
    return {
        id: treatment._id,
        name: treatment.name,
        dateStart: treatment.dateStart,
        dateEnd: treatment.dateEnd,
        status: treatment.status,
        idPatient: treatment.idPatient,
        idDoctor: treatment.idDoctor
    };
};

export const sendTreatmentsFormated = (arrayTreatments) => {
    return arrayTreatments.map(treatment => ({
        id: treatment._id,
        name: treatment.name,
        dateStart: treatment.dateStart,
        dateEnd: treatment.dateEnd,
        status: treatment.status,
        idPatient: treatment.idPatient,
        idDoctor: treatment.idDoctor
    }));
};
