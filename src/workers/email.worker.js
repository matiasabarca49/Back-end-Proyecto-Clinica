import { Worker } from "bullmq";
import { redisQueue } from "../config/redisQueue.config.js";
import transporter from "../config/mailer.config.js";

const worker = new Worker(
  "emailQueue",
  async (job) => {

    if (job.name === "sendEmail") {

      await transporter.sendMail({
        from: `"Clínica Odontológica" <${process.env.EMAIL_USER}>`,
        to: job.data.to,
        subject: job.data.subject,
        html: job.data.html
      });

    }

  },
  {
    connection: redisQueue
  }
);