import { Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RegisterModule } from './register/register.module';

const moduleMetadata: ModuleMetadata = {
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    RegisterModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
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
  controllers: [AuthController]
};
@Module(moduleMetadata)
export class AuthModule {}
