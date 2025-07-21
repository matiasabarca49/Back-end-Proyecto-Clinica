import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
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
    phone:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    professionalLicense: {
        type: String,
        required: true,
        unique: true
    }
});
mongoose.plugin(mongoosePaginate)

export const Doctor = mongoose.model("doctors", doctorSchema);
