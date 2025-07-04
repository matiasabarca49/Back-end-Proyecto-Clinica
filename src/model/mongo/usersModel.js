import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    rol:{
        type: String,
        enum: ["Admin","Doctor","Employee"],
        required: true
    }
});
mongoose.plugin(mongoosePaginate)

export const User = mongoose.model("users", userSchema);