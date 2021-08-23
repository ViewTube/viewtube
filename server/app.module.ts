import { CacheModule, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CacheConfigService } from './cache-config.service';
import { ApiRequest, ApiRequestSchema } from './metrics/schemas/api-request.schema';

const redisPort = isNaN(parseInt(process.env.VIEWTUBE_REDIS_PORT))
  ? 6379
  : parseInt(process.env.VIEWTUBE_REDIS_PORT);

const redisOptions: any = {
  host: process.env.VIEWTUBE_REDIS_HOST,
  port: redisPort
};

if (process.env.VIEWTUBE_REDIS_PASSWORD) {
  redisOptions.password = process.env.VIEWTUBE_REDIS_PASSWORD;
}

const moduleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = `mongodb://${process.env.VIEWTUBE_DATABASE_HOST}:${process.env.VIEWTUBE_DATABASE_PORT}/viewtube`;
        return {
          uri,
          user: process.env.VIEWTUBE_DATABASE_USER,
          pass: process.env.VIEWTUBE_DATABASE_PASSWORD,
          useNewUrlParser: true,
          useFindAndModify: false,
          useCreateIndex: true
        };
      }
    }),
    MongooseModule.forFeature([
      {
        name: ApiRequest.name,
        schema: ApiRequestSchema,
        collection: 'api-requests'
      }
    ]),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    BullModule.forRoot({
      redis: {
        ...redisOptions,
        db: 1
      }
    }),
    ScheduleModule.forRoot(),
    CoreModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService]
};
@Module(moduleMetadata)
export class AppModule {}
