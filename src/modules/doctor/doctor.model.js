import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'
const doctorSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
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
    },
    schedules: {
        monday: { 
                    start: {
                        type: String,
                        default: "9:00"
                    },
                    end: {
                        type: String,
                        default: "18:00"
                    }
                },
        tuesday: { 
                    start: {
                        type: String,
                        default: "9:00"
                    },
                    end: {
                        type: String,
                        default: "18:00"
                    }
                },
        wednesday: { 
                    start: {
                        type: String,
                        default: "9:00"
                    },
                    end: {
                        type: String,
                        default: "18:00"
                    }
                },
        thursday: { 
                    start: {
                        type: String,
                        default: "9:00"
                    },
                    end: {
                        type: String,
                        default: "18:00"
                    }
                },
        friday: { 
                    start: {
                        type: String,
                        default: "9:00"
                    },
                    end: {
                        type: String,
                        default: "18:00"
                    }
                },
        saturday: { 
                    start: {
                        type: String,
                        default: "9:00"
                    },
                    end: {
                        type: String,
                        default: "18:00"
                    }
                },
    },
    // true = activo, false = inactivo (no recibe turnos). Por defecto activo, para que la respuesta siempre traiga el estado
    status: {
        type: Boolean,
        default: true
    },
    // Soft delete: true = activo, false = dado de baja. La ficha no se borra para no romper sus turnos
    active: {
        type: Boolean,
        default: true
    },
    color: {
        type: String,
        default: "#8f897fff"
    },
    // Duración de cada slot en minutos. Mismo rango que doctor.validation.js: con 0 no se podrían armar los slots del día
    frequency: {
        type: Number,
        default: 30,
        min: 5,
        max: 240
    },
},{ timestamps: { createdAt: 'created', updatedAt: 'lastChange' }});
mongoose.plugin(mongoosePaginate)

export const Doctor = mongoose.model("doctors", doctorSchema);
