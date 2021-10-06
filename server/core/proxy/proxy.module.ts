import { Module, CacheModule, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from 'server/cache-config.service';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';

const moduleMetadata: ModuleMetadata = {
  providers: [ProxyService],
  controllers: [ProxyController],
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ]
};

@Module(moduleMetadata)
export class ProxyModule {}
