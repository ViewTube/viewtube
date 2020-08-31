import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${process.env.VIEWTUBE_DATABASE_HOST}/viewtube`, {
      user: process.env.VIEWTUBE_DATABASE_USER,
      pass: process.env.VIEWTUBE_DATABASE_PASSWORD,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true
    }),
    ScheduleModule.forRoot(),
    CoreModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
