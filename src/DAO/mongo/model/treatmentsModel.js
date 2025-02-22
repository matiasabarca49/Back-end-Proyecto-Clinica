import mongoose from "mongoose";

// Creación del Modelo
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

// Population para cargar datos relacionados (Paciente y Doctor)
treatmentSchema.pre("find", function() {
    this.populate("idPatient").populate("idDoctor");
});

treatmentSchema.pre("findOne", function() {
    this.populate("idPatient").populate("idDoctor");
});

// Exportación del Modelo
export const Treatment = mongoose.model("treatments", treatmentSchema);
