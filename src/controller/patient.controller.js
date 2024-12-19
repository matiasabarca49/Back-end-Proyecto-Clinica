import PatientsManager from "../DAO/mongo/patients.mongo.js";
const patientsManager = new PatientsManager();

export const getPatients = async (req, res)=>{
    const patientsGetted = await patientsManager.getPatients();
    patientsGetted
    ? res.status(200).send({status: "Success", patients : patientsGetted})
    : res.status(500).send({status: "ERROR", reason: "Los Pacientes no se pudieron obtener"})
}

export const getPatientById = async (req, res)=>{
    const patientID = req.params.id.trim();
    const patientGetted = await patientsManager.getPatientById(patientID);
    patientGetted
    ? res.status(200).send({status: "Success", patients :patientGetted}) : res.status(404).send({status: "ERROR"})
}
export const getPatientByFilter = async (req, res) =>{
    const filter = req.query;
    const patientGetted = await patientsManager.getPatientByFilter(filter);
    patientGetted
    ? res.status(200).send({status: "Succes", patients :  patientGetted})
    : res.status(404).send({status: "ERROR"})

}
export const createPatient = async (req, res)=>{
    const patient = req.body
    const patientCreated = await patientsManager.createPatient(patient);
    patientCreated
    ?res.status(201).send({status: "Success", patients : patientCreated}) : res.status(404).send({status:"ERROR"})

}
export const deletePatient = async (req, res) =>{
    const patientID = req.params.id;
    const patientDeleted = await patientsManager.deletePatient(patientID);
    patientDeleted
    ? res.status(200).send({status: "Succes", patients : patientDeleted})
    : res.status(404).send({status: "ERROR"})

}
export const updatePatient = async (req, res) =>{
    const patientData = req.body;
    const idPatient=req.params.id.trim();
    console.log(patientData)
    
    const patientUpdated = await patientsManager.updatePatient(idPatient,patientData);
    console.log(patientUpdated)
    patientUpdated
    ? res.status(201).send({status: "Succes", patients : patientUpdated
        })
        : res.status(404).send({status: "ERROR"})
        
}




