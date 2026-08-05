import { getRedisClient } from "../../../config/redis.config.js";

export const redisCheck = async () => {
    try {
        const redisClient = await getRedisClient(); // Asegúrate de que esta función esté importada correctamente desde tu configuración de Redis
        
        if (!redisClient) {
            return {
                name: "redis",
                status: "DOWN",
                latency: null,
                error: "Redis client not initialized"
            };
        }

        const start = performance.now();
        await redisClient.ping();
        const latency = performance.now() - start;

        return {
            name: "redis",
            status: "UP",
            latency: { value: Number(latency.toFixed(2)), unit: "ms" }
        };

    } catch (error) {
        return {
            name: "redis",
            status: "DOWN",
            latency: null,
            error: "Connection timeout"
        };
    }
};