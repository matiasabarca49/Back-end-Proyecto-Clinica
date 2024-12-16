import DoctorsManager from "../DAO/mongo/doctors.mongo.js";
const doctorsManager = new DoctorsManager();

export const getDoctors = async (req, res)=>{
    const doctorsGetted = await doctorsManager.getDoctors();
    doctorsGetted
    ? res.status(200).send({status: "Succes", doctors : doctorsGetted})
    : res.status(500).send({status: "ERROR", reason: "Los usuarios no se pudieron obtener"})
}

