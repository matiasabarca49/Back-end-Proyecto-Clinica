/**
 * Definición del esquema de la colección 'patients' para la base de datos MongoDB.
 * Este esquema describe la estructura de los documentos de pacientes, incluyendo campos como nombre, apellido, DNI, etc.
 */
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const patientsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    birth:{
        type: String,
        required: true
    },
    DNI:{
        type: String,
        unique: true,
        required: true
    },
    sex:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    medicalCoverage:{
        type: String,
        required: true
    },
    nAffiliate:{
        type: String,
        required: true
    },
    appointments: [
        {
            date:{
                type: Date,
                required: true 
            },
            IDdoctor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'doctors',
            },
            status: {
                type: String,
                enum:["Pending", "Finalized", "Canceled" ]  
            }
        }
    ],
    treatments: [
        {
            name:{
                type: String,
                required: true 
            },
            dateStart: {
                type: String,
                required: true,
            },
            dateEnd: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                enum:["Pending", "Finalized", "Canceled" ]
            },
            IDPatient:{
                type: String,
            },
            IDdoctor: {
                type: String,
            }
        }
    ],
    observations: [
        {
            name:{
                type: String,
                required: true 
            },
            date: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                enum:["Pending", "Finalized", "Canceled" ]  
            }  
        }
    ],
    dentalStatus: {
        dientesSupLeft: {
            type: Array
        },
        dientesSupRight:{
            type: Array
        },
        dientesInfLeft:{
            type: Array
        },
        dientesInfRight:{
            type: Array
        }
    }
});

// Plugin para la paginación de documentos en la base de datos.
mongoose.plugin(mongoosePaginate)

/**
 * Funciones de pre-consulta para poblar los datos relacionados de las citas.
 * La función `populate` carga los datos del doctor asociado a cada cita.
 */
patientsSchema.pre("find", function(){
    this.populate('appointments.IDdoctor')
});
patientsSchema.pre("findOne", function(){
    this.populate('appointments.IDdoctor')
});

// Exportación del modelo Patient
export const Patient = mongoose.model("patients", patientsSchema);
