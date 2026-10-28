/**
 * Expresión regular de búsqueda (contiene, sin distinguir mayúsculas) a partir de un texto del usuario
 *
 * El texto se escapa: se busca tal cual. Sin escapar, "(" lanza un error (500) y patrones como
 * "(a+)+$" pueden bloquear la instancia evaluando la expresión (ReDoS).
 *
 * @param {String} text Texto a buscar
 * @returns {RegExp}
 */
export const searchRegex = (text) => new RegExp(String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
