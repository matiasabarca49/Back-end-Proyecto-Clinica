from io import BytesIO

from reportlab.pdfgen import canvas
from utils.odontograma_helper import dibujar_odontograma
from utils.patients_helper import dibujar_informacion_paciente, dibujar_tratamientos, dibujar_observaciones
from reportlab.lib.pagesizes import A4


def generate_patient_pdf(patient):

    buffer = BytesIO()

    pdf = canvas.Canvas(buffer)

    pdf.setTitle("Historia Clínica")

    y = 800

    width, height = A4

    y = height - 50

    y = dibujar_informacion_paciente(pdf, x=50, y=y, patient=patient, ancho_contenido=width - 100)

    # Estado dental
    y -= 15
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Estado Dental")

    y -= 40

    y = dibujar_odontograma(pdf, x0=60, y0=y, dientes_json=patient.dentalStatus, size=26)
    
    # TratamientoS
    y -= 25

    if patient.treatments:
        y = dibujar_tratamientos(pdf, x=50, y=y, treatments=patient.treatments, ancho_contenido=width - 100, page_height= height)
    else:
        pdf.drawString(70, y, "No hay tratamientos registrados.")

    y -= 20

    # Observaciones
    y -= 25

    if patient.observations:
        y = dibujar_observaciones(pdf, x=50, y=y, observations=patient.observations, page_height= height, ancho_contenido=width - 100)
    

    y -= 20

    pdf.save()

    pdf_content = buffer.getvalue()

    buffer.close()

    return pdf_content


