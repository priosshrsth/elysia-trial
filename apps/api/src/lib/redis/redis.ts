import { RedisClient } from "bun";
import { appConfig } from "src/config/app.config";

export const redis = new RedisClient(appConfig.REDIS_URL);
