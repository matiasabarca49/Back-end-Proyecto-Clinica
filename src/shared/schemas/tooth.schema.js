import mongoose from "mongoose";

// Caras del diente y marcas booleanas de toothSchema.
// Se exportan para que la validación y las reglas sobre dientes usen la misma lista que el esquema.
export const CARIES_FACES = ["vestibular", "mesial", "oclusal", "distal", "lingual"];
export const TOOTH_FLAGS = ["corona", "extracted", "allcaries", "incurable", "malposition", "periodontal", "inscrustration"];

//Esquema de dientes
export const toothSchema = new mongoose.Schema({
  tooth: { type: Number, required: true },
  caries: {
    vestibular: { type: String, default: "0" },
    mesial: { type: String, default: "0" },
    oclusal: { type: String, default: "0" },
    distal: { type: String, default: "0" },
    lingual: { type: String, default: "0" }
  },
  corona: { type: Boolean, default: false },
  extracted: { type: Boolean, default: false },
  allcaries: { type: Boolean, default: false },
  incurable: { type: Boolean, default: false },
  malposition: { type: Boolean, default: false },
  periodontal: { type: Boolean, default: false },
  inscrustration: { type: Boolean, default: false }
}, { _id: false });