import { Queue } from "bullmq";
import { redisQueue } from "../config/redisQueue.config.js";

export const emailQueue = new Queue("emailQueue", {
  connection: redisQueue
});