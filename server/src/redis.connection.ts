import Consola from 'consola';
import Redis, { RedisOptions } from 'ioredis';

export const checkRedisConnection = async () => {
  const redisHost = process.env.VIEWTUBE_REDIS_HOST;
  const redisPort = process.env.VIEWTUBE_REDIS_PORT;
  const redisPassword = process.env.VIEWTUBE_REDIS_PASSWORD;

  if (redisHost) {
    const redisOptions: RedisOptions = {
      host: redisHost,
      port: parseInt(redisPort),
      retryStrategy: null
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

    if (pong === 'PONG') {
      Consola.success('Redis connection established');
      return;
    }
  }
  throw new Error('Redis connection failed');
};
