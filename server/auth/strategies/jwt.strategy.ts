import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        request => (request.cookies ? request.cookies.Authentication : null),
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.VIEWTUBE_JWT_SECRET,
      issuer: 'viewtube-api',
      audience: 'viewtube-web'
    });
  }

  validate(payload: any): { username: string } {
    return { username: payload.username };
  }
}
