import SessionRepository from "../base/session.repository.js";
import { getRedisClient } from "../../config/redis.config.js";

class RedisRepository extends SessionRepository {

    constructor() {
        super();
    }

    async create(session) {
        // Obtener la instancia del cliente Redis
        const redisClient = await getRedisClient();
        const {userId,  expiration } = session;
        const redisInstance = await redisClient.set(`session:${userId}`, 'true', { EX: expiration });
        return redisInstance;
    }

    async findById(sessionId) {
        const sessionData = await this.redisClient.get(`session:${sessionId}`);
        if (!sessionData) return null;
        const { userId, data } = JSON.parse(sessionData);
        return { sessionId, userId, data };
    }

    async resetExpiration(userId, expiration) {
        const redisClient = await getRedisClient();
        const result = await redisClient.expire(`session:${userId}`, expiration);
        return result === 1; // Devuelve true si la expiración se actualizó correctamente
    }

    async delete(sessionId) {
        const redisClient = await getRedisClient();
        const result = await redisClient.del(`session:${sessionId}`);
        return result > 0;
    }

    async deleteByUserId(userId) {
        const keys = await this.redisClient.keys('session:*');
        let deletedCount = 0;

        for (const key of keys) {
            const sessionData = await this.redisClient.get(key);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session.userId === userId) {
                    await this.redisClient.del(key);
                    deletedCount++;
                }
            }
        }

        return deletedCount;
    }

    async saveRefreshToken(userId, refreshToken, expiration) {
        const redisClient = await getRedisClient();
        const redisInstance = await redisClient.set(`refreshToken:${refreshToken}`, userId, { EX: expiration });
        return redisInstance;
    }

    async deleteRefreshToken(refreshToken){
        const redisClient = await getRedisClient();
        const result = await redisClient.del(`refreshToken:${refreshToken}`);
        return result > 0;
    }
}

export default RedisRepository;