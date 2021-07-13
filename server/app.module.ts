import { Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

const moduleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forRoot(`mongodb://${process.env.VIEWTUBE_DATABASE_HOST}/viewtube`, {
      user: process.env.VIEWTUBE_DATABASE_USER,
      pass: process.env.VIEWTUBE_DATABASE_PASSWORD,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.VIEWTUBE_REDIS_HOST,
        port: isNaN(parseInt(process.env.VIEWTUBE_REDIS_PORT))
          ? 6379
          : parseInt(process.env.VIEWTUBE_REDIS_PORT),
        password: process.env.VIEWTUBE_REDIS_PASSWORD,
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
