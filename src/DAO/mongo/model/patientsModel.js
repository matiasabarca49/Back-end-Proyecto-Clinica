import mongoose from "mongoose";

const patientsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    DNI:{
        type: String,
        unique: true,
        required: true
    },
    Sex:{
        type: String,
        required: true
    },
    Adress:{
        type: String,
        required: true
    },
    Phone:{
        type: String,
        required: true
    },
    Email:{
        type: String,
        required: true
    },
    appointments: [
        {
            date:{
                type: Date,
                required: true 
            },
            doctorID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Doctor',
            },
            status: {
                type: String,
                enum:["Pending", "Finalized", "Canceled" ]  }
            
        }
    ]
});

export const Patient = mongoose.model("patients", patientsSchema);