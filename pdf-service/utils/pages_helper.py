MARGEN_INFERIOR = 50

def verificar_salto_pagina(c, y, alto_necesario, page_height, margen_inferior=MARGEN_INFERIOR):
    """
    Chequea si queda espacio vertical para dibujar el próximo bloque.
    Si no alcanza, cierra la página actual y arranca una nueva.

    Retorna el `y` actualizado (mismo valor si no hubo salto de página,
    o el tope de la hoja nueva si sí lo hubo).
    """
    if y - alto_necesario < margen_inferior:
        c.showPage()
        return page_height - 50  # margen superior de la hoja nueva
    return y