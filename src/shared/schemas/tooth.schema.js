import mongoose from "mongoose";

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