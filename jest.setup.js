import { connectDB, disconnectDB } from "./__test__/helpers.tests.js";
import { closeRedis } from "./src/config/redis.config.js";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
  await closeRedis()
});
