from reportlab.lib.colors import HexColor

COLOR_PRIMARIO = HexColor("#1f2667")
COLOR_TEXTO = HexColor("#2c3e50")
COLOR_LABEL = HexColor("#8a8f9c")
COLOR_DIVISOR = HexColor("#dcdde1")


def dibujar_informacion_paciente(c, x, y, patient, ancho_contenido):
    """
    Dibuja el bloque completo de "Historia Clínica" (título + datos
    personales + contacto + cobertura médica) a partir de un objeto
    `patient`, arrancando en (x, y) como esquina superior izquierda.

    Retorna el nuevo valor de `y` (cursor), ya libre para lo que
    se dibuje a continuación (ej. el odontograma).
    """

    # --- Helpers internos (encapsulados, no ensucian el namespace global) ---

    def _titulo_seccion(titulo_x, titulo_y, texto):
        c.setFillColor(COLOR_PRIMARIO)
        c.rect(titulo_x, titulo_y - 3, 4, 15, fill=1, stroke=0)

        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(COLOR_PRIMARIO)
        c.drawString(titulo_x + 12, titulo_y, texto)

        c.setStrokeColor(COLOR_DIVISOR)
        c.setLineWidth(0.6)
        c.line(titulo_x, titulo_y - 10, titulo_x + ancho_contenido, titulo_y - 10)

    def _campo(campo_x, campo_y, label, valor):
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(COLOR_LABEL)
        c.drawString(campo_x, campo_y, label.upper())

        c.setFont("Helvetica", 11)
        c.setFillColor(COLOR_TEXTO)
        c.drawString(campo_x, campo_y - 13, str(valor) if valor not in (None, "") else "—")

    def _grilla_campos(grilla_x, grilla_y, campos, col_width=250, fila_alto=34, columnas=2):
        for i, (label, valor) in enumerate(campos):
            col = i % columnas
            fila = i // columnas
            _campo(grilla_x + col * col_width, grilla_y - fila * fila_alto, label, valor)

        filas_totales = -(-len(campos) // columnas)  # ceil
        return grilla_y - (filas_totales * fila_alto)

    # --- Título principal ---
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(COLOR_PRIMARIO)
    c.drawString(x, y, "Historia Clínica")

    c.setStrokeColor(COLOR_PRIMARIO)
    c.setLineWidth(1.4)
    c.line(x, y - 10, x + ancho_contenido, y - 10)

    y -= 40

    # --- Datos personales ---
    _titulo_seccion(x, y, "Datos personales")
    y -= 30

    y = _grilla_campos(x, y, [
        ("Nombre", patient.name),
        ("Apellido", patient.lastName),
        ("Fecha de nacimiento", patient.birth),
        ("Tipo de DNI", patient.typeDNI),
        ("DNI", patient.dni),
        ("Sexo", patient.sex),
    ])

    # --- Contacto ---
    y -= 15
    _titulo_seccion(x, y, "Contacto")
    y -= 30

    y = _grilla_campos(x, y, [
        ("Dirección", patient.address),
        ("Teléfono", patient.phone),
        ("Email", patient.email),
    ])

    # --- Cobertura médica ---
    y -= 15
    _titulo_seccion(x, y, "Cobertura médica")
    y -= 30

    y = _grilla_campos(x, y, [
        ("Cobertura", patient.medicalCoverage),
        ("Número de afiliado", patient.nAffiliate),
    ])

    return y