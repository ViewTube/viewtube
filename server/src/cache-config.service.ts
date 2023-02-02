import { CacheModuleOptions, CacheOptionsFactory, Injectable } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import { redisStore } from 'cache-manager-ioredis-yet';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  async createCacheOptions(): Promise<CacheModuleOptions> {
    if (process.env.NODE_ENV === 'production') {
      const redisOptions: RedisOptions = {
        host: process.env.VIEWTUBE_REDIS_HOST,
        port: parseInt(process.env.VIEWTUBE_REDIS_PORT),
        db: 0
      };

      if (process.env.VIEWTUBE_REDIS_PASSWORD) {
        redisOptions.password = process.env.VIEWTUBE_REDIS_PASSWORD;
      }

      const store = await redisStore(redisOptions);

      return {
        store,
        max: 20000,
        ttl: 1800
      };
    }

    // Development options
    return {
      ttl: 0,
      max: 2000
    };
  }
}
