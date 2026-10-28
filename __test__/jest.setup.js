import { connectDB, disconnectDB } from "./helpers.tests.js";
import { closeRedis } from "../src/config/redis.config.js";
import { closeRedisQueue } from "../src/config/redisQueue.config.js";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
  await closeRedis()
  await closeRedisQueue()
});


