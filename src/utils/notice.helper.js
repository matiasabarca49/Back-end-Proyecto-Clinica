/**
 * Helpers para el manejo de avisos
 * Funciones utilitarias para fechas, colores y prioridades
 */

/**
 * Formatea una fecha para mostrar de manera amigable
 * @param {String} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {String} Fecha formateada
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
};

/**
 * Verifica si una fecha pertenece a la semana actual
 * @param {String} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Boolean} True si la fecha está dentro de los últimos 7 días
 */
export const isThisWeek = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return date >= oneWeekAgo && date <= today;
};

/**
 * Obtiene el rango de fechas de la semana actual
 * @returns {Object} Objeto con fechas de inicio y fin de la semana
 */
export const getCurrentWeekRange = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
        start: oneWeekAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
    };
};

/**
 * Calcula los días transcurridos desde una fecha
 * @param {String} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Number} Número de días transcurridos
 */
export const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Asigna un color según el tipo de aviso
 * @param {String} type - Tipo de aviso (important, info, success, warning)
 * @returns {String} Código de color hexadecimal
 */
export const getColorByType = (type) => {
    const colors = {
        important: '#EF4444',  // Rojo
        info: '#3B82F6',       // Azul
        success: '#10B981',    // Verde
        warning: '#F59E0B'     // Amarillo/Naranja
    };
    
    return colors[type] || colors.info;
};

/**
 * Asigna un color según la prioridad del aviso
 * @param {String} priority - Prioridad del aviso (high, medium, low)
 * @returns {String} Código de color hexadecimal
 */
export const getColorByPriority = (priority) => {
    const colors = {
        high: '#DC2626',      // Rojo intenso
        medium: '#F59E0B',    // Naranja
        low: '#10B981'        // Verde
    };
    
    return colors[priority] || colors.medium;
};

/**
 * Obtiene un objeto con información completa del aviso incluyendo colores
 * @param {Object} notice - Objeto aviso
 * @returns {Object} Aviso con información de colores y formato de fecha
 */
export const enrichNoticeData = (notice) => {
    return {
        ...notice,
        colorByType: getColorByType(notice.type),
        colorByPriority: getColorByPriority(notice.priority),
        formattedDate: formatDate(notice.date),
        daysAgo: getDaysAgo(notice.date),
        isThisWeek: isThisWeek(notice.date)
    };
};

/**
 * Filtra avisos por rango de fechas
 * @param {Array} notices - Array de avisos
 * @param {String} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {String} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Array} Avisos filtrados por rango de fechas
 */
export const filterByDateRange = (notices, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return notices.filter(notice => {
        const noticeDate = new Date(notice.date);
        return noticeDate >= start && noticeDate <= end;
    });
};

/**
 * Ordena avisos por fecha (más reciente primero)
 * @param {Array} notices - Array de avisos
 * @param {String} order - 'asc' o 'desc' (por defecto 'desc')
 * @returns {Array} Avisos ordenados por fecha
 */
export const sortByDate = (notices, order = 'desc') => {
    return notices.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
};

/**
 * Agrupa avisos por prioridad
 * @param {Array} notices - Array de avisos
 * @returns {Object} Objeto con avisos agrupados por prioridad
 */
export const groupByPriority = (notices) => {
    return {
        high: notices.filter(n => n.priority === 'high'),
        medium: notices.filter(n => n.priority === 'medium'),
        low: notices.filter(n => n.priority === 'low')
    };
};

/**
 * Agrupa avisos por tipo
 * @param {Array} notices - Array de avisos
 * @returns {Object} Objeto con avisos agrupados por tipo
 */
export const groupByType = (notices) => {
    return {
        important: notices.filter(n => n.type === 'important'),
        info: notices.filter(n => n.type === 'info'),
        success: notices.filter(n => n.type === 'success'),
        warning: notices.filter(n => n.type === 'warning')
    };
};

/**
 * Calcula estadísticas de los avisos
 * @param {Array} notices - Array de avisos
 * @returns {Object} Objeto con estadísticas
 */
export const getNoticesStats = (notices) => {
    return {
        total: notices.length,
        byPriority: {
            high: notices.filter(n => n.priority === 'high').length,
            medium: notices.filter(n => n.priority === 'medium').length,
            low: notices.filter(n => n.priority === 'low').length
        },
        byType: {
            important: notices.filter(n => n.type === 'important').length,
            info: notices.filter(n => n.type === 'info').length,
            success: notices.filter(n => n.type === 'success').length,
            warning: notices.filter(n => n.type === 'warning').length
        },
        thisWeek: notices.filter(n => isThisWeek(n.date)).length
    };
};