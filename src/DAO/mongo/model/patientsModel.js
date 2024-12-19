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
                ref: 'doctors',
            },
            status: {
                type: String,
                enum:["Pending", "Finalized", "Canceled" ]  }
            
        }
    ]
});
//Population
patientsSchema.pre("find", function(){
    this.populate('appointments.doctorID')
})
patientsSchema.pre("findOne", function(){
    this.populate('appointments.doctorID')
})
export const Patient = mongoose.model("patients", patientsSchema);