from pydantic import BaseModel

class PatientPDF(BaseModel):
    name: str
    lastName: str
    birth: str
    typeDNI: str
    dni: str
    sex: str
    address: str
    phone: str
    email: str
    medicalCoverage: str
    nAffiliate: str
    treatments: list
    observations: list
    dentalStatus: list