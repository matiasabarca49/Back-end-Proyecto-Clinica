/**
 * Definición del esquema de la colección 'patients' para la base de datos MongoDB.
 * Este esquema describe la estructura de los documentos de pacientes, incluyendo campos como nombre, apellido, DNI, etc.
 */
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

// Verificamos si el modelo está en la caché para evitar errores
/* if (mongoose.models["patients"]) {
  delete mongoose.models["patients"];
} */

//Esquema de dientes
const toothSchema = new mongoose.Schema({
  tooth: { type: Number, required: true },
  caries: {
    vestibular: { type: String, default: "0" },
    mesial: { type: String, default: "0" },
    oclusal: { type: String, default: "0" },
    distal: { type: String, default: "0" },
    lingual: { type: String, default: "0" }
  },
  corona: { type: Boolean, default: false },
  extracted: { type: Boolean, default: false },
  allcaries: { type: Boolean, default: false },
  incurable: { type: Boolean, default: false },
  malposition: { type: Boolean, default: false },
  periodontal: { type: Boolean, default: false },
  inscrustration: { type: Boolean, default: false }
}, { _id: false }); // _id: false evita que cada diente tenga su propio _id

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
    typeDNI:{
        type: String,
    },
    dni:{
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
                enum:["progress","pending", "finalized", "canceled" ]
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
                enum:["pending", "finalized", "canceled" ]  
            }  
        }
    ],
    dentalStatus: [toothSchema],
    status:{
        type: String,
        enum: ["active", "inactive", "blocked"],
        default: "active"
    },
    idDoctor: {
            type: String,
            required: true
        }
}, {timestamps: {createdAt: 'created', updatedAt: 'lastChange'} });

// Plugin para la paginación de documentos en la base de datos.
mongoose.plugin(mongoosePaginate)


// Exportación del modelo Patient
export const Patient = mongoose.model("patients", patientsSchema);







