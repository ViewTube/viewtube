import { CacheModuleOptions, CacheOptionsFactory, Injectable } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    if (process.env.NODE_ENV === 'production') {
      const redisOptions: RedisOptions = {
        host: process.env.VIEWTUBE_REDIS_HOST,
        port: parseInt(process.env.VIEWTUBE_REDIS_PORT)
      };

      if (process.env.VIEWTUBE_REDIS_PASSWORD) {
        redisOptions.password = process.env.VIEWTUBE_REDIS_PASSWORD;
      }

      return {
        store: redisStore,
        ...redisOptions,
        db: 0,
        max: 20000,
        ttl: 1800
      };
    }
    return null;
  }
}
