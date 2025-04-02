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
        this.name = doctor.name;
        this.lastName = doctor.lastName;
        this.dni = doctor.dni;
        this.professionalLicense = doctor.professionalLicense;
        this.patients = [];
    }

    /**
     * Método para devolver el objeto doctor formateado.
     * @returns {Object} Objeto con los datos del doctor en formato estructurado.
     */

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

/**
 * Función que recibe un doctor y devuelve sus datos formateados.
 * @param {Object} doctor Objeto doctor con los datos a formatear.
 * @returns {Object} Objeto con los datos del doctor en formato estructurado.
 */

export const sendDoctorFormated = (doctor) => {
    return {
        id: doctor._id,
        name: doctor.name,
        lastName: doctor.lastName,
        dni: doctor.dni,
        professionalLicense: doctor.professionalLicense,
        patients: doctor.patients
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
            patients: doctor.patients
        }
    })
    return arrayMaped;
};
