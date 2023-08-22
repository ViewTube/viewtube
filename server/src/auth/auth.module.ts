import { Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RegisterModule } from './register/register.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'server/user/schemas/user.schema';

const moduleMetadata: ModuleMetadata = {
  providers: [AuthService],
  imports: [
    ConfigModule,
    RegisterModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: 'users'
      }
    ]),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          global: true,
          secret: process.env.VIEWTUBE_JWT_SECRET,
          signOptions: {
            expiresIn: '12h',
            issuer: 'viewtube-api',
            audience: 'viewtube-web'
          }
        };
      }
    })
  ],
  controllers: [AuthController],
  exports: [AuthService]
};
@Module(moduleMetadata)
export class AuthModule {}
