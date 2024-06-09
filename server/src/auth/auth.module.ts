import { Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'server/user/schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWT_EXPIRATION } from './constants/session';
import { PublicAuthGuard } from './guards/public-auth.guard';
import { RegisterModule } from './register/register.module';
import { Session, SessionSchema } from './schemas/session.schema';

const moduleMetadata: ModuleMetadata = {
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: PublicAuthGuard
    }
  ],
  imports: [
    ConfigModule,
    RegisterModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: 'users'
      },
      {
        name: Session.name,
        schema: SessionSchema,
        collection: 'sessions'
      }
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.VIEWTUBE_JWT_SECRET,
      signOptions: {
        expiresIn: JWT_EXPIRATION,
        issuer: 'viewtube-api',
        audience: 'viewtube-web'
      }
    })
  ],
  controllers: [AuthController],
  exports: [AuthService]
};
@Module(moduleMetadata)
export class AuthModule {}
