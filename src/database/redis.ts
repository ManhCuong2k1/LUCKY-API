import redis from "redis";
import config from "../config";

export const clientOptions = {
  host: config.REDIS_HOST || "localhost",
  port: config.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_HOST_NAME ? { servername: process.env.REDIS_HOST_NAME } : undefined,
};

export const redisClient = redis.createClient(clientOptions);
