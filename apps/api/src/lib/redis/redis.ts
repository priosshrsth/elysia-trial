import { appConfig } from "@api/config/app.config";
import { RedisClient } from "bun";

export const redis = new RedisClient(appConfig.REDIS_URL);
