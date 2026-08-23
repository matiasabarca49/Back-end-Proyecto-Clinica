"""
Odontograma en PDF con reportlab (canvas puro).

Cada diente se dibuja como un cuadrado dividido en 5 caras:
- oclusal/incisal (centro)
- vestibular (arriba)
- lingual/palatino (abajo)
- mesial (izquierda)
- distal (derecha)

Se traduce 1 a 1 la lógica que usamos con matplotlib.patches,
pero acá con c.line() / p.moveTo() / p.lineTo() de reportlab.
"""

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white

# FDI: cuadrantes 1-4 (superior der/izq, inferior izq/der), 8 dientes c/u
CUADRANTES = {
    "sup_der": [18, 17, 16, 15, 14, 13, 12, 11],
    "sup_izq": [21, 22, 23, 24, 25, 26, 27, 28],
    "inf_der": [31, 32, 33, 34, 35, 36, 37, 38],
    "inf_izq": [48, 47, 46, 45, 44, 43, 42, 41],
}

CUADRANTES_TEMP = {
    "sup_der": [61, 62, 63, 64, 65],
    "sup_izq": [55, 54, 53, 52, 51],
    "inf_izq": [85, 84, 83, 82, 81],
    "inf_der": [71, 72, 73, 74, 75],
}


# Estados clínicos -> color (mismo criterio que usarías desde el backend)
ESTADO_COLOR = {
    "sano": white,
    "caries": HexColor("#e74c3c"),
    "obturado": HexColor("#3498db"),
    "ausente": HexColor("#7f8c8d"),
    "corona": HexColor("#f1c40f"),
    "extraccion_indicada": HexColor("#e67e22"),
}


def dibujar_diente(c, x, y, size=28, numero=None, caras=None, borde=black,
                    extracted=False, corona=False, flags=None):
    if caras is None:
        caras = {}
    if flags is None:
        flags = []

    # --- Determinar orientación según el número FDI ---
    es_superior = True
    es_derecho = True
    if numero is not None:
        cuadrante = int(str(numero)[0])
        if cuadrante in (5, 6, 7, 8):  # temporales -> mapear a permanentes
            cuadrante -= 4
        es_superior = cuadrante in (1, 2)
        es_derecho = cuadrante in (1, 4)

    def color_de(cara):
        estado = caras.get(cara, "sano")
        return ESTADO_COLOR.get(estado, white)

    s = size

    if extracted:
        c.setLineWidth(1.2)
        c.setStrokeColor(borde)
        c.setFillColor(HexColor("#ecf0f1"))
        c.rect(x, y, s, s, fill=1, stroke=1)
        c.setStrokeColor(HexColor("#c0392b"))
        c.setLineWidth(1.4)
        c.line(x, y, x + s, y + s)
        c.line(x, y + s, x + s, y)
        if numero is not None:
            c.setFont("Helvetica", 7)
            c.setFillColor(black)
            c.drawCentredString(x + s / 2, y - 10, str(numero))
        _dibujar_flags(c, x, y, s, flags)
        return

    cx, cy = x + s / 2, y + s / 2
    m = s * 0.34

    c.setLineWidth(0.8)
    c.setStrokeColor(borde)

    # --- Vestibular / Lingual: se invierten arriba/abajo según arcada ---
    cara_arriba = "vestibular" if es_superior else "lingual"
    cara_abajo = "lingual" if es_superior else "vestibular"

    c.setFillColor(color_de(cara_arriba))
    p = c.beginPath()
    p.moveTo(x, y + s)
    p.lineTo(x + s, y + s)
    p.lineTo(cx + m / 2, cy + m / 2)
    p.lineTo(cx - m / 2, cy + m / 2)
    p.close()
    c.drawPath(p, fill=1, stroke=1)

    c.setFillColor(color_de(cara_abajo))
    p = c.beginPath()
    p.moveTo(x, y)
    p.lineTo(x + s, y)
    p.lineTo(cx + m / 2, cy - m / 2)
    p.lineTo(cx - m / 2, cy - m / 2)
    p.close()
    c.drawPath(p, fill=1, stroke=1)

    # --- Mesial / Distal: se invierten izquierda/derecha según cuadrante ---
    # Si es diente derecho del paciente, mesial queda a la derecha del cuadro
    # (asumiendo que dibujás el odontograma con el lado derecho del paciente
    # a la izquierda de la hoja, convención estándar en imagen especular).
    cara_izq = "distal" if es_derecho else "mesial"
    cara_der = "mesial" if es_derecho else "distal"

    c.setFillColor(color_de(cara_izq))
    p = c.beginPath()
    p.moveTo(x, y)
    p.lineTo(x, y + s)
    p.lineTo(cx - m / 2, cy + m / 2)
    p.lineTo(cx - m / 2, cy - m / 2)
    p.close()
    c.drawPath(p, fill=1, stroke=1)

    c.setFillColor(color_de(cara_der))
    p = c.beginPath()
    p.moveTo(x + s, y)
    p.lineTo(x + s, y + s)
    p.lineTo(cx + m / 2, cy + m / 2)
    p.lineTo(cx + m / 2, cy - m / 2)
    p.close()
    c.drawPath(p, fill=1, stroke=1)

    # --- Oclusal (cuadrado central) ---
    c.setFillColor(color_de("oclusal"))
    c.rect(cx - m / 2, cy - m / 2, m, m, fill=1, stroke=1)

    if "PER" in flags:
        c.setFont("Helvetica-Bold", 5)
        c.setFillColor(black)
        c.drawCentredString(cx, cy - 1.5, "PD")

    c.setFillColor(white)
    c.setLineWidth(1.2)
    c.rect(x, y, s, s, fill=0, stroke=1)

    if corona:
        c.setStrokeColor(HexColor("#8e44ad"))
        c.setLineWidth(1.6)
        c.circle(cx, cy, s * 0.62, fill=0, stroke=1)

    if numero is not None:
        c.setFont("Helvetica", 7)
        c.setFillColor(black)
        c.drawCentredString(cx, y - 10, str(numero))

    _dibujar_flags(c, x, y, s, flags)


def _dibujar_flags(c, x, y, s, flags):
    """Dibuja códigos cortos (ej. 'MAL', 'PER') debajo del número del diente."""
    if not flags:
        return
    c.setFont("Helvetica", 5)
    c.setFillColor(HexColor("#c0392b"))
    texto = " ".join(flags)
    c.drawCentredString(x + s / 2, y - 18, texto)


def procesar_diente_json(diente_obj):
    """
    Traduce un objeto del array del documento al formato interno
    esperado por dibujar_diente().

    Estructura esperada de diente_obj (tal cual la guarda el documento):
    {
      "tooth": 36,
      "caries": {"vestibular": "0", "mesial": "0", "oclusal": "0",
                 "distal": "0", "lingual": "0"},
      "corona": false,
      "extracted": true,
      "allcaries": false,
      "incurable": false,
      "malposition": false,
      "periodontal": false,
      "inscrustration": false
    }

    Retorna: (numero, caras_dict, extracted, corona, flags)
    """
    numero = diente_obj.get("tooth")
    caries = diente_obj.get("caries", {}) or {}
    allcaries = bool(diente_obj.get("allcaries"))

    caras = {}
    for cara in ("vestibular", "mesial", "oclusal", "distal", "lingual"):
        valor = str(caries.get(cara, "0"))
        if allcaries or valor == "1":
            caras[cara] = "caries"
        elif valor == "2":
            caras[cara] = "obturado"
        else:
            caras[cara] = "sano"

    # Códigos cortos para condiciones de diente completo sin ícono propio
    flags = []
    if diente_obj.get("incurable"):
        flags.append("INC")
    if diente_obj.get("malposition"):
        flags.append("MAL")
    if diente_obj.get("periodontal"):
        flags.append("PER")
    if diente_obj.get("inscrustration"):
        flags.append("INCR")

    return (
        numero,
        caras,
        bool(diente_obj.get("extracted")),
        bool(diente_obj.get("corona")),
        flags,
    )


def dibujar_odontograma(c, x0, y0, dientes_json=None, size=26, gap=4, espacio_medio=8, espacio_medio_temp=5):
    """
    Dibuja el odontograma completo (32 dientes permanentes + 20 temporales)
    arrancando en (x0, y0), esquina superior izquierda del bloque superior.

    dientes_json: array de objetos tal como los guarda el documento,
                  ej. [{"tooth": 36, "caries": {...}, "corona": false, ...}, ...]
    """
    dientes_json = dientes_json or []

    # Indexamos por número de diente para acceso O(1)
    datos_por_diente = {}
    for obj in dientes_json:
        numero, caras, extracted, corona, flags = procesar_diente_json(obj)
        datos_por_diente[numero] = dict(
            caras=caras, extracted=extracted, corona=corona, flags=flags
        )

    def datos_de(num):
        return datos_por_diente.get(num, dict(
            caras=None, extracted=False, corona=False, flags=[]
        ))

    paso = size + gap

    # ---------- Permanentes ----------

    # Fila superior: sup_der (izq→der) + sup_izq (izq→der)
    fila_sup = CUADRANTES["sup_der"] + CUADRANTES["sup_izq"]
    mitad_sup = len(CUADRANTES["sup_der"])  # índice de corte 11/21

    x = x0
    for i, num in enumerate(fila_sup):
        if i == mitad_sup:
            x += espacio_medio
        d = datos_de(num)
        dibujar_diente(c, x, y0, size=size, numero=num, **d)
        x += paso

    # Fila inferior: inf_izq (izq→der) + inf_der (izq→der)
    fila_inf = CUADRANTES["inf_izq"] + CUADRANTES["inf_der"]
    mitad_inf = len(CUADRANTES["inf_izq"])  # índice de corte 41/31
    y_sup = y0 - size - 25  # separación entre arcadas

    x = x0
    for i, num in enumerate(fila_inf):
        if i == mitad_inf:
            x += espacio_medio
        d = datos_de(num)
        dibujar_diente(c, x, y_sup, size=size, numero=num, **d)
        x += paso

    # ---------- Temporales ----------

    # Fila superior: sup_izq (izq→der) + sup_der (izq→der)
    fila_sup = CUADRANTES_TEMP["sup_izq"] + CUADRANTES_TEMP["sup_der"]
    mitad_sup_temp = len(CUADRANTES_TEMP["sup_izq"])
    y_sup = y_sup - size - 30  # separación entre arcadas

    x = 150
    for i, num in enumerate(fila_sup):
        if i == mitad_sup_temp:
            x += espacio_medio_temp
        d = datos_de(num)
        dibujar_diente(c, x, y_sup, size=size, numero=num, **d)
        x += paso

    # Fila inferior: inf_izq (izq→der) + inf_der (izq→der)
    fila_inf = CUADRANTES_TEMP["inf_izq"] + CUADRANTES_TEMP["inf_der"]
    mitad_inf_temp = len(CUADRANTES_TEMP["inf_izq"])
    y_sup = y_sup - size - 25

    x = 150
    for i, num in enumerate(fila_inf):
        if i == mitad_inf_temp:
            x += espacio_medio_temp
        d = datos_de(num)
        dibujar_diente(c, x, y_sup, size=size, numero=num, **d)
        x += paso

    return y_sup - 15

