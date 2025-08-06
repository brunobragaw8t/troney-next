import { env } from "@/env";
import { Redis } from "@upstash/redis";

export const redisClient = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});
