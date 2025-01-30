import mongoose from "mongoose";

// Creación del Modelo para Appointments
const appointmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctors',
        required: true
    },
    patientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patients',
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Finalized", "Canceled"],
        required: true
    },
    observations: {
        type: String
    }
});

// Population
appointmentSchema.pre("find", function() {
    this.populate("doctorID").populate("patientID");
});
appointmentSchema.pre("findOne", function() {
    this.populate("doctorID").populate("patientID");
});

// Exportación del Modelo
export const Appointment = mongoose.model("appointments", appointmentSchema);
