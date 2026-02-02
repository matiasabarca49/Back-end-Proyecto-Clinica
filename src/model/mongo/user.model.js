import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema(
  {
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
      enum: ["admin", "doctor", "employee"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "suspended", "disabled"],
    },
    lastLogintAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: {createdAt: 'created', updatedAt: 'lastChange'} },
);
mongoose.plugin(mongoosePaginate);

export const User = mongoose.model("users", userSchema);
