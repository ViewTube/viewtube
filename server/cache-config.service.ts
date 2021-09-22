import { CacheModuleOptions, CacheOptionsFactory, Injectable } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    if (process.env.NODE_ENV === 'production') {
      const redisPort = isNaN(parseInt(process.env.VIEWTUBE_REDIS_PORT))
        ? 6379
        : parseInt(process.env.VIEWTUBE_REDIS_PORT);

      const redisOptions: any = {
        host: process.env.VIEWTUBE_REDIS_HOST,
        port: redisPort
      };

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
