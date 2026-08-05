import { emailQueue } from "../../../queues/email.queue.js";

export const queueCheck = async () => {
    try {
        
        const start = performance.now();
        
        const jobs = await emailQueue.getJobCounts();

        const latency = Number((performance.now() - start).toFixed(2));

        return {
            status: "UP",
            latency: { value: latency, unit: "ms" },
            jobs,
        };

    } catch (error) {
        return { status: "DOWN", error: "Connection timeout" };
    }
}