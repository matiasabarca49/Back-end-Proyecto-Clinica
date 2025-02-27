import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dni: {
        type: String,
        required: true,
        unique: true
    },
    professionalLicense: {
        type: String,
        required: true,
        unique: true
    },
    patients: [
        {
            IDPatient:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'patients'
            }
        }
    ]
});

doctorSchema.pre("find", function() {
    this.populate('patients.IDPatient');
});
doctorSchema.pre("findOne", function() {
    this.populate('patients.IDPatient');
});

export const Doctor = mongoose.model("doctors", doctorSchema);
