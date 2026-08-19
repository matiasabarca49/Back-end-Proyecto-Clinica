from io import BytesIO

from reportlab.pdfgen import canvas
from utils.odontograma_helper import dibujar_odontograma
from utils.patients_helper import dibujar_informacion_paciente
from reportlab.lib.pagesizes import A4


def generate_patient_pdf(patient):

    buffer = BytesIO()

    pdf = canvas.Canvas(buffer)

    pdf.setTitle("Historia Clínica")

    y = 800

    width, height = A4
    y = height - 50

    y = dibujar_informacion_paciente(pdf, x=50, y=y, patient=patient, ancho_contenido=width - 100)

    # Tratamientos
    y -= 15

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Tratamientos")

    y -= 25

    pdf.setFont("Helvetica", 11)

    if patient.treatments:
        for treatment in patient.treatments:
            pdf.drawString(70, y, str(treatment))
            y -= 20
    else:
        pdf.drawString(70, y, "No hay tratamientos registrados.")
        y -= 20

    # Observaciones
    y -= 15

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Observaciones")

    y -= 25

    pdf.setFont("Helvetica", 11)

    if patient.observations:
        for observation in patient.observations:
            pdf.drawString(70, y, str(observation))
            y -= 20
    else:
        pdf.drawString(70, y, "No hay observaciones registradas.")
        y -= 20

    # Estado dental
    y -= 15
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Estado Dental")

    y -= 40

    dibujar_odontograma(pdf, x0=60, y0=y, dientes_json=patient.dentalStatus, size=26)


    pdf.save()

    pdf_content = buffer.getvalue()

    buffer.close()

    return pdf_content


