import { Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    UserModule,
    ConfigModule.forRoot(),
    RegisterModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('VIEWTUBE_JWT_SECRET'),
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
