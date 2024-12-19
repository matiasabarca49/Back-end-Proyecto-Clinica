import mongoose from "mongoose";
//Creacion del Modelo
const doctorSchema = new mongoose.Schema({
    //Nombre de Atributo y Tipo
    name:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    dni:{
        type: String,
        required: true,
        unique: true
    },
    professionalLicense:{
        type: String,
        required: true,
        unique: true
    },
    patients:[
        {
            patientID:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'patients'
            }   
    }
  ]
});
//Population
doctorSchema.pre("find", function(){
    this.populate('patients.patientID')
})
doctorSchema.pre("findOne", function(){
    this.populate('patients.patientID')
})
//Exportación del Modelo
export const Doctor = mongoose.model("doctors", doctorSchema);