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
    status: {
        type: String,
        enum: ['active', 'inactive']
    },
    color: {
        type: String,
        default: "#8f897fff"
    }
},{ timestamps: { createdAt: 'created', updatedAt: 'lastChange' }});
mongoose.plugin(mongoosePaginate)

export const Doctor = mongoose.model("doctors", doctorSchema);
