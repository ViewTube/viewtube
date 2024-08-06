import Redis, { RedisOptions } from 'ioredis';
import { logger } from './logger';

export const checkRedisConnection = async () => {
  const redisHost = process.env.VIEWTUBE_REDIS_HOST;
  const redisPort = process.env.VIEWTUBE_REDIS_PORT;
  const redisPassword = process.env.VIEWTUBE_REDIS_PASSWORD;

  if (!redisHost) {
    throw new Error('Redis host not set');
  }
  logger.log('Checking Redis connection');
  const redisOptions: RedisOptions = {
    host: redisHost,
    port: parseInt(redisPort),
    retryStrategy: null,
    connectTimeout: 1000
  };
  if (redisPassword) {
    redisOptions.password = redisPassword;
  }

  let redis: Redis;
  let pong: string;

  try {
    redis = new Redis(redisOptions);
    pong = await redis.ping();
  } catch {
    // Drop silently
  }
  redis.disconnect();

  if (pong !== 'PONG') {
    throw new Error('Redis connection failed');
  }
  logger.log('Redis connection established');
};
