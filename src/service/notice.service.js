import { Notice } from "../model/mongo/notice.model.js";
import { normalizeText } from "../utils/utils.js";
import { 
  enrichNoticeData, 
  isThisWeek, 
  getColorByPriority 
} from "../utils/notice.helper.js";
import BaseService from "./base.service.js";
import MongoRepository from "../repositories/implementations/mongo.repository.js";
import { NoticeDTO } from "../dto/notice.dto.js";
import { NotFoundError, ValidationError } from "../exceptions/validations.exception.js";
export default class NoticesService extends BaseService {
  constructor() {
    const repository = new MongoRepository(Notice)
    super(repository)
  }

  /**
   * 🔹 Obtiene todos los avisos según el rol del usuario
   */
  async findAll(user) {
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

    const notices = await this.repository.findManyByFilter(query);
    if (!notices) return [];
    const formatted = this.toManyDTO(notices).map(enrichNoticeData);
    return formatted;
  }

  /**
   * 🔹 Obtiene un aviso por ID
   */
  async findById(id) {
    const noticeFounded = await super.findById(id);
    if (!noticeFounded) throw new NotFoundError("Notice", id);
    return enrichNoticeData(this.toDTO(noticeFounded));
  }

  /**
   * 🔹 Obtiene avisos paginados
   */
  async paginateNotices(dQuery = {}, dLimit, dPage, dSort, user) {
    let noticesGetted;

    if (user?.rol === "doctor") {
      // Filtrar avisos visibles o dirigidos a ese doctor
      dQuery = { 
        ...dQuery, 
        $or: [
          { visibility: "general" },
          { targetDoctor: user.id }
        ]
      };
    }

    noticesGetted = await this.repository.findPaginate(dQuery, dLimit, dPage, dSort);

    console.log(noticesGetted)
    
    if (noticesGetted) {
      noticesGetted.docs = this.toManyDTO(noticesGetted.docs).map(enrichNoticeData);
    }

    return noticesGetted;
  }

  /**
   * 🔹 Busca avisos que coincidan con texto
   */
  async findBytitleOrDescription(query) {
    const searchRegex = new RegExp(query, "i");
    const found = await this.repository.findByFilter({
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    });

    if (!found) return [];
    return this.toManyDTO(found).map(enrichNoticeData);
  }

  /**
   * 🔹 Crea un nuevo aviso
   */
 async create(newNotice, user) {
    if (!user) throw new Error("Falta el parametro user");
    if (!["admin", "employee"].includes(user.rol)) {
        throw new Error("No autorizado para crear avisos");
    }

    const noticeNormalized = {
        ...newNotice,
        title: normalizeText(newNotice.title),
        visibility: newNotice.visibility || "general",
        targetDoctor: newNotice.visibility === "particular" ? newNotice.targetDoctor : null
    };

    const noticeFormatted = new NoticeDTO(noticeNormalized);
    const noticeAdded = await super.create(noticeFormatted);

    if (!noticeAdded) throw new Error("Error al crear notice");

    return this.toDTO(noticeAdded); // ← este era el fix
}
  /**
   * 🔹 Elimina un aviso por ID
   */
  async delete(noticeID, user) {
    if (!["admin", "employee"].includes(user?.rol)) {
      throw new ValidationError("No autorizado para eliminar avisos");
    }
    const deletedNotice = await super.delete(noticeID);
    if (!deletedNotice) throw new NotFoundError("Notice", noticeID);
    return this.toDTO(deletedNotice)
  }

  /**
   * 🔹 Actualiza un aviso por ID
   */
  async update(noticeID, toUpdate, user) {
    if (!["admin", "employee"].includes(user?.rol)) {
        throw new ValidationError("No autorizado para actualizar avisos");
    }
    // Verificar que existe antes de actualizar
    const exists = await super.findById(noticeID);
    if (!exists) throw new NotFoundError("Notice", noticeID);
    
    await super.update(noticeID, toUpdate);
    
    // Buscar el documento actualizado
    const updated = await super.findById(noticeID);
    return this.toDTO(updated);
}
  /**
   * 🔹 Filtra avisos por prioridad
   */
  async getNoticesByPriority(priority) {
    const notices = await this.repository.findByFilter({ priority });
    if (!notices) return [];

    return this.toManyDTO(notices).map(n => ({
      ...enrichNoticeData(n),
      colorByPriority: getColorByPriority(priority)
    }));
  }

  /**
   * 🔹 Filtra avisos de la semana actual
   */
  async getNoticesThisWeek() {
    const notices = await super.findAll(Notice);
    if (!notices) return [];

    return this.toManyDTO(notices)
      .filter(n => isThisWeek(n.date))
      .map(enrichNoticeData);
  }


  // ================= DTO mappers =================
  
      toDTO(notice) {
          return NoticeDTO.toResponse(notice);
      }
  
      toManyDTO(notices) {
          return notices.map(p => NoticeDTO.toResponse(p));
      }
  
      toFormatDTO(data) {
         return new NoticeDTO(data);
      }

}
