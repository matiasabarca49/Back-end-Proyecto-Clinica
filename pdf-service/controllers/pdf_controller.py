from fastapi.responses import Response

from services.pdf_services import generate_patient_pdf


def generate_pdf(patient):

    pdf_content = generate_patient_pdf(patient)

    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=historia-clinica.pdf"
        }
    )