from fastapi.responses import Response
from datetime import date

from services.pdf_services import generate_patient_pdf


def generate_pdf(patient):

    pdf_content = generate_patient_pdf(patient)

    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="historia_clinica_{patient.name}_{patient.lastName}_{date.today()}.pdf"'
        }
    )