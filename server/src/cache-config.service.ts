import KeyvRedis, { RedisClientOptions } from '@keyv/redis';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  async createCacheOptions(): Promise<CacheModuleOptions> {
    if (process.env.NODE_ENV === 'production') {
      const redisOptions: RedisClientOptions = {
        socket: {
          host: process.env.VIEWTUBE_REDIS_HOST,
          port: parseInt(process.env.VIEWTUBE_REDIS_PORT)
        },
        database: 0
      };

      if (process.env.VIEWTUBE_REDIS_PASSWORD) {
        redisOptions.password = process.env.VIEWTUBE_REDIS_PASSWORD;
      }

      const store = new KeyvRedis(redisOptions);

      return {
        stores: [store],
        max: 20000,
        ttl: 1800000
      };
    }

    // Development options
    return {
      store: {
        get: (..._args) => undefined,
        set: (..._args) => undefined,
        del: (..._args) => undefined
      }
    };
  }
}
