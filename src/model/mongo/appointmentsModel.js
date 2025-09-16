import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
// Creación del Modelo para Appointments
const appointmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    slots: {
        type: [Number], // uno o varios slots (ej: [4] o [10,11,12])
        required: true,
        validate: {
            validator: function(slots) {
                return slots.every(s => s >= 0 && s <= 17); // 18 slots en total
            },
            message: "Los slots deben estar entre 0 y 17"
            }
    },
    room: {
        type: String
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
        enum: ["Pending", "Confirmed", "NoShow", "Rescheduled","Finalized", "Canceled"],
        required: true
    },
    observations: {
        type: String,
        maxlength: 500
    }
});
mongoose.plugin(mongoosePaginate)

// Population
appointmentSchema.pre("find", function() {
    this.populate("doctorID").populate("patientID");
});
appointmentSchema.pre("findOne", function() {
    this.populate("doctorID").populate("patientID");
});

// Exportación del Modelo
export const Appointment = mongoose.model("appointments", appointmentSchema);
