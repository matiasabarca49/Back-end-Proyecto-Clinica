/**
 * Clase que formatea la información de un aviso.
 * targetDoctor apunta al _id del usuario con rol Doctor (colección users)
 */
export class NoticeFormated {
    constructor(notice) {
        this.title = notice.title;
        this.description = notice.description;
        this.date = notice.date;
        this.type = notice.type;
        this.priority = notice.priority;
        this.visibility = notice.visibility || "general";

        // 👇 Aseguramos que siempre se guarde el _id del usuario con rol Doctor
        this.targetDoctor = notice.targetDoctor 
            ? (typeof notice.targetDoctor === "object"
                ? notice.targetDoctor._id 
                : notice.targetDoctor)
            : null;

        // Este idDoctor puede mantenerse si lo usás para otro propósito interno
        this.idDoctor = notice.idDoctor || null;
    }

    sendNotice() {
        return {
            id: this._id,
            title: this.title,
            description: this.description,
            date: this.date,
            type: this.type,
            priority: this.priority,
            visibility: this.visibility,
            targetDoctor: this.targetDoctor, // _id del usuario doctor
            idDoctor: this.idDoctor
        };
    }
}

/**
 * 🔹 Formatea un aviso
 */
export const sendNoticeFormated = (notice) => ({
    id: notice._id,
    title: notice.title,
    description: notice.description,
    date: notice.date,
    type: notice.type,
    priority: notice.priority,
    visibility: notice.visibility,
    targetDoctor: notice.targetDoctor
        ? (typeof notice.targetDoctor === "object"
            ? notice.targetDoctor._id
            : notice.targetDoctor)
        : null,
    idDoctor: notice.idDoctor,
    createdAt: notice.createdAt,
    updatedAt: notice.updatedAt
});

/**
 * 🔹 Formatea varios avisos
 */
export const sendNoticesFormated = (arrayNotices) =>
    arrayNotices.map(notice => ({
        id: notice._id,
        title: notice.title,
        description: notice.description,
        date: notice.date,
        type: notice.type,
        priority: notice.priority,
        visibility: notice.visibility,
        targetDoctor: notice.targetDoctor
            ? (typeof notice.targetDoctor === "object"
                ? notice.targetDoctor._id
                : notice.targetDoctor)
            : null,
        idDoctor: notice.idDoctor,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt
    }));



export class NoticeDTO{
    constructor(notice) {
        this.title = notice.title;
        this.description = notice.description;
        this.date = notice.date;
        this.type = notice.type;
        this.priority = notice.priority;
        this.visibility = notice.visibility || "general";

        // 👇 Aseguramos que siempre se guarde el _id del usuario con rol Doctor
        this.targetDoctor = notice.targetDoctor 
            ? (typeof notice.targetDoctor === "object"
                ? notice.targetDoctor._id 
                : notice.targetDoctor)
            : null;

        // Este idDoctor puede mantenerse si lo usás para otro propósito interno
        this.idDoctor = notice.idDoctor || null;
    }

    static toResponse(notice){
        return {
            id: notice._id,
            title: notice.title,
            description: notice.description,
            date: notice.date,
            type: notice.type,
            priority: notice.priority,
            visibility: notice.visibility,
            targetDoctor: notice.targetDoctor
                ? (typeof notice.targetDoctor === "object"
                    ? notice.targetDoctor._id
                    : notice.targetDoctor)
                : null,
            idDoctor: notice.idDoctor,
            createdAt: notice.createdAt,
            updatedAt: notice.updatedAt
        }
                
    }
}
