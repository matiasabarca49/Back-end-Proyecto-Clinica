import { getRedisClient } from "../../config/redis.config.js";

export default class CacheService {
    
    async set(key, value, ttlSeconds) {
        const redisInstance = await getRedisClient()
        await redisInstance.set(
            key, 
            JSON.stringify(value),
            'EX',
            ttlSeconds
        );
    }

    async get(key) {
        const redisInstance = await getRedisClient()
        const data = await redisInstance.get(key);
        if (!data) {
            return null;
        }

    return JSON.parse(data);
    }


    async del(key) {
        const redisInstance = await getRedisClient()
        await redisInstance.del(key);
    }

}