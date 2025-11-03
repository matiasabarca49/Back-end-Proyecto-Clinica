// config/mailer.js
import nodemailer from "nodemailer";

const createTransport = () =>{
  if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS){
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
