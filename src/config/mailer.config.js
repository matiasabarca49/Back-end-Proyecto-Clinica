// config/mailer.js
import nodemailer from "nodemailer";
import { validateEnvVars } from "../utils/dotenv.helper.js";

const createTransport = () =>{
  if(!validateEnvVars("email")){
    return
  }else{
    return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  }
}

const transporter = createTransport();

export default transporter;
