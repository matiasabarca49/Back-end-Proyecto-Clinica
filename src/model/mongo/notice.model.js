import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const noticesSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    type: { 
        type: String, 
        enum: ["important", "info", "success", "warning"],
        default: "info", 
        required: true 
    },
    priority: { 
        type: String, 
        enum: ["high", "medium", "low"], 
        default: "medium", 
        required: true 
    },
    visibility: { 
        type: String, 
        enum: ["general", "particular"], 
        default: "general", 
        required: true 
    },
    
    targetDoctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users", 
        required: function() { return this.visibility === "particular"; } 
    }
}, { timestamps: {createdAt: 'created', updatedAt: 'lastChange'} });

// Plugin de paginación
noticesSchema.plugin(mongoosePaginate);

// Exportamos el modelo
export const Notice = mongoose.model("notices", noticesSchema);
