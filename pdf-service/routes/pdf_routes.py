from fastapi import APIRouter

from models.patient_model import PatientPDF
from controllers.pdf_controller import generate_pdf


router = APIRouter()


@router.post("/medical-history-pdf")
def generate_patient_pdf_route(patient: PatientPDF):

    return generate_pdf(patient)