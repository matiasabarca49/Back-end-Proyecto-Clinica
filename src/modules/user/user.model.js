import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    //Datos Básicos
    name: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ["admin", "doctor", "employee", "dashboard"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "suspended", "disabled"],
    },
    // Soft delete: true = activo, false = dado de baja. El usuario no se borra para no romper sus referencias
    active: {
      type: Boolean,
      default: true,
    },
    //Actividad
    lastLogintAt: {
      type: Date,
      default: null,
    },
    //Seguridad contraseña
    // Seguridad de contraseña
    mustChangePassword: { 
      type: Boolean, 
      default: true },
    passwordChangedAt: { 
      type: Date, 
      default: null },
    passwordHistory: {
      type: Array,
      default: []
    }
  },
  { timestamps: { createdAt: "created", updatedAt: "lastChange" } },
);
mongoose.plugin(mongoosePaginate);

export const User = mongoose.model("users", userSchema);
