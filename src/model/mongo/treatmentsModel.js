/**
 * Definición del esquema de la colección 'treatments' para la base de datos MongoDB.
 * Este esquema describe la estructura de los documentos de tratamientos, incluyendo campos como nombre, fechas, doctor, paciente, etc.
 */
import mongoose from "mongoose";

// Creación del modelo de tratamiento.
const treatmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateStart: {
        type: Date,
        required: true
    },
    dateEnd: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["In progress", "Completed", "Canceled"],
        default: "In progress"
    },
    idPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patients",
        required: true
    },
    idDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctors",
        required: true
    }
});

// Population para cargar los datos relacionados con el paciente y el doctor.
treatmentSchema.pre("find", function() {
    this.populate("idPatient").populate("idDoctor");
});

treatmentSchema.pre("findOne", function() {
    this.populate("idPatient").populate("idDoctor");
});

// Exportación del modelo Treatment
export const Treatment = mongoose.model("treatments", treatmentSchema);
