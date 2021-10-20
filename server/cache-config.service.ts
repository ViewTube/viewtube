import { CacheModuleOptions, CacheOptionsFactory, Injectable } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}
  createCacheOptions(): CacheModuleOptions {
    if (this.configService.get('NODE_ENV') === 'production') {
      const redisOptions: RedisOptions = {
        host: this.configService.get('VIEWTUBE_REDIS_HOST'),
        port: this.configService.get<number>('VIEWTUBE_REDIS_PORT')
      };

      if (this.configService.get('VIEWTUBE_REDIS_PASSWORD')) {
        redisOptions.password = this.configService.get('VIEWTUBE_REDIS_PASSWORD');
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
