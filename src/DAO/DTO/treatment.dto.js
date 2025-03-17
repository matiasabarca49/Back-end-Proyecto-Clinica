/**
 * Clase que formatea la información de un tratamiento.
 * Se encarga de estructurar los datos recibidos y de prepararlos para ser enviados.
 */
export class TreatmentFormated {
    
    /**
     * Constructor de la clase.
     * @param {Object} treatment Objeto tratamiento con los datos a formatear.
     */
    constructor(treatment) {
        this.name = treatment.name;
        this.dateStart = treatment.dateStart;
        this.dateEnd = treatment.dateEnd;
        this.status = treatment.status;
        this.idPatient = treatment.idPatient;
        this.idDoctor = treatment.idDoctor;
    }

    /**
     * Método para devolver el objeto tratamiento formateado.
     * @returns {Object} Objeto con los datos del tratamiento en formato estructurado.
     */
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

/**
 * Función que recibe un tratamiento y devuelve sus datos formateados.
 * @param {Object} treatment Objeto tratamiento con los datos a formatear.
 * @returns {Object} Objeto con los datos del tratamiento en formato estructurado.
 */
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

/**
 * Función que recibe un arreglo de tratamientos y devuelve un arreglo con los datos de cada uno formateados.
 * @param {Array} arrayTreatments Arreglo de objetos tratamientos a formatear.
 * @returns {Array} Arreglo con los datos de los tratamientos en formato estructurado.
 */
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
