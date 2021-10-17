import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        request => (request.cookies ? request.cookies.Authentication : null),
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('VIEWTUBE_JWT_SECRET'),
      issuer: 'viewtube-api',
      audience: 'viewtube-web'
    });
  }

  validate(payload: any): { username: string } {
    return { username: payload.username };
  }
}
