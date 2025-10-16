import PersistController from "../../DAO/persistController.js";
import { 
  sendNoticeFormated, 
  NoticeFormated, 
  sendNoticesFormated 
} from "../../dto/notice.dto.js";
import { Notice } from "../../model/mongo/notice.model.js";
import { normalizeText } from "../../utils/utils.js";
import { 
  enrichNoticeData, 
  isThisWeek, 
  getColorByPriority 
} from "../../utils/notice.helper.js";

const persistController = new PersistController();

export default class NoticesService {
  constructor() {}

  /**
   * 🔹 Obtiene todos los avisos según el rol del usuario
   */
  async getNotices(user) {
    let query = {};

    if (!user) {
      console.warn("⚠️ No se recibió 'user' en getNotices.");
    } else if (user.rol === "Doctor") {
      // Los doctores ven avisos generales o dirigidos a ellos
      query = {
        $or: [
          { visibility: "general" },
          { targetDoctor: user.id } // apunta al _id del usuario con rol Doctor
        ]
      };
    }

    const notices = await persistController.getDocumentsByFilter(Notice, query);
    if (!notices) return [];

    const formatted = sendNoticesFormated(notices).map(enrichNoticeData);
    return formatted;
  }

  /**
   * 🔹 Obtiene un aviso por ID
   */
  async getNoticeById(id) {
    const noticeFounded = await persistController.getDocumentByID(Notice, id);
    return noticeFounded ? enrichNoticeData(sendNoticeFormated(noticeFounded)) : false;
  }

  /**
   * 🔹 Obtiene avisos por filtro dinámico
   */
  async getNoticeByFilter(filter) {
    const noticeFounded = await persistController.getDocumentByFilter(Notice, filter);
    return noticeFounded ? enrichNoticeData(sendNoticeFormated(noticeFounded)) : false;
  }

  /**
   * 🔹 Obtiene avisos paginados
   */
  async getNoticePaginate(dQuery, dLimit, dPage, dSort, user) {
    let noticesGetted;

    if (user?.rol === "Doctor") {
      // Filtrar avisos visibles o dirigidos a ese doctor
      dQuery = { 
        ...dQuery, 
        $or: [
          { visibility: "general" },
          { targetDoctor: user.id }
        ]
      };
    }

    noticesGetted = await persistController.getDocumentsPaginate(Notice, dQuery, dLimit, dPage, dSort);
    
    if (noticesGetted) {
      noticesGetted.docs = sendNoticesFormated(noticesGetted.docs).map(enrichNoticeData);
    }

    return noticesGetted || false;
  }

  /**
   * 🔹 Busca avisos que coincidan con texto
   */
  async getNoticeByQuery(query) {
    const searchRegex = new RegExp(query, "i");
    const found = await persistController.getDocumentByQuery(Notice, {
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    });

    if (!found) return [];
    return sendNoticesFormated(found).map(enrichNoticeData);
  }

  /**
   * 🔹 Crea un nuevo aviso
   */
  async createNotice(newNotice, user) {
    if (!user) return { status: false, error: "Usuario no autenticado" };
    if (!["Admin", "Employee"].includes(user.rol)) {
      return { status: false, error: "No autorizado para crear avisos" };
    }

    const noticeNormalized = {
      ...newNotice,
      title: normalizeText(newNotice.title),
      visibility: newNotice.visibility || "general",
      targetDoctor: newNotice.visibility === "particular" ? newNotice.targetDoctor : null
    };

    const noticeFormatted = new NoticeFormated(noticeNormalized);
    const noticeAdded = await persistController.createDocument(Notice, noticeFormatted);

    if (noticeAdded.status) {
      return { ...noticeAdded, dt: enrichNoticeData(sendNoticeFormated(noticeAdded.dt)) };
    } else {
      return noticeAdded;
    }
  }

  /**
   * 🔹 Elimina un aviso por ID
   */
  async deleteNotice(noticeID, user) {
    if (!["Admin", "Employee"].includes(user?.rol)) {
      return { status: false, error: "No autorizado para eliminar avisos" };
    }
    return persistController.deleteDocument(Notice, noticeID);
  }

  /**
   * 🔹 Actualiza un aviso por ID
   */
  async updateNotice(noticeID, toUpdate, user) {
    if (!["Admin", "Employee"].includes(user?.rol)) {
      return { status: false, error: "No autorizado para actualizar avisos" };
    }

    const updated = await persistController.updateDocument(Notice, noticeID, toUpdate);
    if (updated.status) {
      return { ...updated, dt: enrichNoticeData(sendNoticeFormated(updated.dt)) };
    } else {
      return updated;
    }
  }

  /**
   * 🔹 Filtra avisos por prioridad
   */
  async getNoticesByPriority(priority) {
    const notices = await persistController.getDocumentsByFilter(Notice, { priority });
    if (!notices) return [];

    return sendNoticesFormated(notices).map(n => ({
      ...enrichNoticeData(n),
      colorByPriority: getColorByPriority(priority)
    }));
  }

  /**
   * 🔹 Filtra avisos de la semana actual
   */
  async getNoticesThisWeek() {
    const notices = await persistController.getDocuments(Notice);
    if (!notices) return [];

    return sendNoticesFormated(notices)
      .filter(n => isThisWeek(n.date))
      .map(enrichNoticeData);
  }
}
