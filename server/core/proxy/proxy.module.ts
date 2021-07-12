import { Module, CacheModule, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';

const moduleMetadata: ModuleMetadata = {
  providers: [ProxyService],
  controllers: [ProxyController],
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      ttl: 43200,
      max: 5000
    })
  ]
};

@Module(moduleMetadata)
export class ProxyModule {}
