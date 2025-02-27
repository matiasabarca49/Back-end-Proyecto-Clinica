import DoctorsManager from "../DAO/mongo/doctors.mongo.js";
const doctorsManager = new DoctorsManager();

export const getDoctors = async (req, res) => {
    const doctorsGetted = await doctorsManager.getDoctors();
    doctorsGetted
        ? res.status(200).send({ status: "Succes", doctors: doctorsGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getDoctorById = async (req, res) => {
    const doctorID = req.params.id;
    const doctorGetted = await doctorsManager.getDoctorById(doctorID);
    doctorGetted
        ? res.status(200).send({ status: "Succes", doctors: doctorGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getDoctorByFilter = async (req, res) => {
    const filter = req.query;
    const doctorGetted = await doctorsManager.getDoctorByFilter(filter);
    doctorGetted
        ? res.status(200).send({ status: "Succes", doctors: doctorGetted })
        : res.status(404).send({ status: "ERROR" });
};

export const getDoctorsPaginate = async (req, res) => {
    let defaultQuery, defaultLimit, defaultPage, defaultSort;
    const { search, query, sort, page, limit } = req.query;
    console.log(req.query);
    limit && (defaultLimit = parseInt(limit));
    page && (defaultPage = parseInt(page));
    sort && (defaultSort = { lastName: parseInt(sort) });
    search.length !== 0
        ? (defaultQuery = { lastName: search })
        : query !== "0" && (defaultQuery = { specialty: query });
    const doctorsGetted = await doctorsManager.getDoctorsPaginate(defaultQuery, defaultLimit, defaultPage, defaultSort);
    console.log(doctorsGetted);
    doctorsGetted
        ? res.status(200).send({ status: "Success", doctors: doctorsGetted })
        : res.status(500).send({ status: "ERROR" });
};

export const createDoctor = async (req, res) => {
    const doctor = req.body;
    const doctorCreated = await doctorsManager.createDoctor(doctor);
    doctorCreated
        ? res.status(201).send({ status: "Succes", doctors: doctorCreated })
        : res.status(404).send({ status: "ERROR" });
};

export const deleteDoctor = async (req, res) => {
    const doctorID = req.params.id;
    const doctorDeleted = await doctorsManager.deleteDoctor(doctorID);
    doctorDeleted
        ? res.status(200).send({ status: "Succes", doctors: doctorDeleted })
        : res.status(404).send({ status: "ERROR" });
};

export const updateDoctor = async (req, res) => {
    const doctorData = req.body;
    const idDoctor = req.params.id;
    console.log(doctorData);
    
    const doctorUpdated = await doctorsManager.updateDoctor(idDoctor, doctorData);
    console.log(doctorUpdated);
    doctorUpdated
        ? res.status(201).send({ status: "Succes", doctors: doctorUpdated })
        : res.status(404).send({ status: "ERROR" });
};
