from reportlab.lib.colors import HexColor
from utils.pages_helper import verificar_salto_pagina

COLOR_PRIMARIO = HexColor("#1f2667")
COLOR_TEXTO = HexColor("#2c3e50")
COLOR_LABEL = HexColor("#8a8f9c")
COLOR_DIVISOR = HexColor("#dcdde1")

ETIQUETA_GENERO = {
    "male": "Hombre",
    "female": "Mujer",
    "another": "Otro",
    "other": "Otros",
}


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
        ("Sexo", ETIQUETA_GENERO.get(patient.sex, "Desconocido")),
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

""" 
TRATAMIENTOS
"""

COLOR_ESTADO = {
    "progress": HexColor("#e67e22"),      # en progreso - naranja
    "completed": HexColor("#27ae60"),     # completado - verde
    "pending": HexColor("#7f8c8d"),       # pendiente - gris
    "cancelled": HexColor("#c0392b"),
    "finalized": HexColor("#27ae60")     # finalizado - verde
}

ETIQUETA_ESTADO = {
    "progress": "En progreso",
    "completed": "Completado",
    "pending": "Pendiente",
    "cancelled": "Cancelado",
    "finalized": "Finalizado",
}


def dibujar_tratamientos(c, x, y, treatments, ancho_contenido,  page_height, fila_alto=26):
    """
    Dibuja la sección "Tratamientos" a partir de un array de objetos:
    [{"name": ..., "dateStart": ..., "dateEnd": ..., "status": ..., "_id": {...}}, ...]

    Arranca en (x, y) como esquina superior izquierda del bloque.
    Retorna el nuevo valor de `y` (cursor), libre para lo que siga.
    """
    treatments = treatments or []

    altura_necesaria = 28 - 8 - fila_alto
    
    y = verificar_salto_pagina(c, y, alto_necesario= altura_necesaria, page_height = page_height)

    # --- Título de sección (mismo estilo que el resto de la ficha) ---
    c.setFillColor(COLOR_PRIMARIO)
    c.rect(x, y - 3, 4, 15, fill=1, stroke=0)

    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(COLOR_PRIMARIO)
    c.drawString(x + 12, y, "Tratamientos")

    c.setStrokeColor(COLOR_DIVISOR)
    c.setLineWidth(0.6)
    c.line(x, y - 10, x + ancho_contenido, y - 10)

    y -= 28

    if not treatments:
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColor(COLOR_LABEL)
        c.drawString(x, y, "Sin tratamientos registrados.")
        return y - 20

    # --- Encabezado de columnas ---
    col_nombre = x
    col_inicio = x + ancho_contenido * 0.48
    col_fin = x + ancho_contenido * 0.66
    col_estado = x + ancho_contenido * 0.84

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(COLOR_LABEL)
    c.drawString(col_nombre, y, "TRATAMIENTO")
    c.drawString(col_inicio, y, "INICIO")
    c.drawString(col_fin, y, "FIN")
    c.drawString(col_estado, y, "ESTADO")

    y -= 8
    c.setStrokeColor(COLOR_DIVISOR)
    c.setLineWidth(0.4)
    c.line(x, y, x + ancho_contenido, y)
    y -= fila_alto - 8

    # --- Filas ---
    for tratamiento in treatments:
        #Verificamos el espacio
        y = verificar_salto_pagina(c, y, fila_alto, page_height = page_height)

        nombre = tratamiento.name or "—"
        inicio = tratamiento.dateStart or "—"
        fin = tratamiento.dateEnd or "—"
        status = tratamiento.status or "pending"

        c.setFont("Helvetica", 10)
        c.setFillColor(COLOR_TEXTO)
        c.drawString(col_nombre, y, nombre)
        c.drawString(col_inicio, y, inicio)
        c.drawString(col_fin, y, fin)

        # Badge de estado
        color_badge = COLOR_ESTADO.get(status, COLOR_LABEL)
        texto_badge = ETIQUETA_ESTADO.get(status, status.capitalize())

        c.setFont("Helvetica-Bold", 7.5)
        ancho_texto = c.stringWidth(texto_badge, "Helvetica-Bold", 7.5)
        pad = 5
        badge_w = ancho_texto + pad * 2
        badge_h = 12

        c.setFillColor(color_badge)
        c.roundRect(col_estado, y - 2, badge_w, badge_h, radius=3, fill=1, stroke=0)

        c.setFillColor(COLOR_DIVISOR)
        c.drawString(col_estado + pad, y + 1.5, texto_badge)

        y -= fila_alto

    return y

ESTADO_OBSERVACION_COLOR = {
    "finalized": HexColor("#27ae60"),   # finalizada - verde
    "pending": HexColor("#7f8c8d"),     # pendiente - gris
    "urgent": HexColor("#c0392b"),      # urgente - rojo
}

ETIQUETA_OBSERVACION = {
    "finalized": "Finalizada",
    "pending": "Pendiente",
    "urgent": "Urgente",
}



def dibujar_observaciones(c, x, y, observations, ancho_contenido, page_height, fila_alto=22):
    """
    Dibuja la sección "Observaciones" a partir de un array de objetos:
    [{"name": ..., "date": ..., "status": ..., "_id": {...}}, ...]

    Arranca en (x, y) como esquina superior izquierda del bloque.
    Retorna el nuevo valor de `y` (cursor), libre para lo que siga.
    """
    observations = observations or []

    altura_necesaria = 28 - fila_alto

    y = verificar_salto_pagina(c, y, alto_necesario= altura_necesaria, page_height = page_height)


    c.setFillColor(COLOR_PRIMARIO)
    c.rect(x, y - 3, 4, 15, fill=1, stroke=0)

    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(COLOR_PRIMARIO)
    c.drawString(x + 12, y, "Observaciones")

    c.setStrokeColor(COLOR_DIVISOR)
    c.setLineWidth(0.6)
    c.line(x, y - 10, x + ancho_contenido, y - 10)

    y -= 28

    if not observations:
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColor(COLOR_LABEL)
        c.drawString(x, y, "Sin observaciones registradas.")
        return y - 20

    col_fecha = x
    col_texto = x + 65
    col_estado = x + ancho_contenido * 0.82

    for obs in observations:
        y = verificar_salto_pagina(c, y, fila_alto, page_height = page_height)

        nombre = obs.name or "—"
        fecha = obs.date or "—"
        status = obs.status or "pending"

        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(COLOR_LABEL)
        c.drawString(col_fecha, y, fecha)

        c.setFont("Helvetica", 10)
        c.setFillColor(COLOR_TEXTO)
        # el texto de la observación puede ser largo -> lo recortamos con "..."
        max_ancho = col_estado - col_texto - 10
        texto = nombre
        while c.stringWidth(texto, "Helvetica", 10) > max_ancho and len(texto) > 3:
            texto = texto[:-4] + "..."
        c.drawString(col_texto, y, texto)

        color_badge = ESTADO_OBSERVACION_COLOR.get(status, COLOR_LABEL)
        texto_badge = ETIQUETA_OBSERVACION.get(status, status.capitalize())
        c.setFont("Helvetica-Bold", 7)
        ancho_texto = c.stringWidth(texto_badge, "Helvetica-Bold", 7)
        pad = 5
        c.setFillColor(color_badge)
        c.roundRect(col_estado, y - 2, ancho_texto + pad * 2, 11, radius=3, fill=1, stroke=0)
        c.setFillColor(COLOR_DIVISOR)
        c.drawString(col_estado + pad, y + 1, texto_badge)

        y -= fila_alto

    return y