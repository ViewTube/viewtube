import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PRIVATE_KEY } from '../decorators/private.decorator';
import { FastifyReply, FastifyRequest } from 'fastify';
import { isHttps } from 'viewtube/shared';
import { setAuthCookies } from '../set-auth-cookies';
import { BYPASS_AUTH_KEY } from '../decorators/bypass-auth.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../schemas/session.schema';
import { Model } from 'mongoose';

@Injectable()
export class PublicAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
    @InjectModel(Session.name)
    private readonly SessionModel: Model<Session>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const isPrivate = this.reflector.getAllAndOverride<boolean>(IS_PRIVATE_KEY, targets);
    const isBypassAuth = this.reflector.getAllAndOverride<boolean>(BYPASS_AUTH_KEY, targets);

    if (isBypassAuth) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const accessToken = this.extractAccessTokenFromCookie(request);
    const refreshToken = this.extractRefreshTokenFromCookie(request);

    if (refreshToken) {
      const accessPayload = await this.validateToken(accessToken);
      if (accessPayload) console.log('valid access token');

      if (!accessPayload) {
        console.log('invalid access token');

        const refreshPayload = await this.validateToken(refreshToken);

        if (!refreshPayload) {
          console.log('invalid refresh token');

          if (isPrivate) {
            throw new UnauthorizedException();
          }
          return true;
        }

        console.log(refreshToken);

        const session = await this.SessionModel.findOne({ refreshToken }).exec();

        if (!session) {
          console.log('session not found');

          if (isPrivate) {
            throw new UnauthorizedException();
          }
          return true;
        }

        const payload = { username: refreshPayload.username };
        const newRefreshToken = await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: this.configService.get('VIEWTUBE_JWT_SECRET')
        });
        const newAccessToken = await this.jwtService.signAsync(payload, {
          secret: this.configService.get('VIEWTUBE_JWT_SECRET')
        });

        console.log('generated new tokens');

        await this.SessionModel.findOneAndUpdate(
          { refreshToken },
          {
            refreshToken: newRefreshToken,
            expiresAt: Date.now(),
            lastUsed: Date.now()
          }
        ).exec();

        const secure = this.configService.get('NODE_ENV') === 'production' && isHttps();
        setAuthCookies({
          reply,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          secure
        });

        request['user'] = refreshPayload;
      } else {
        request['user'] = accessPayload;
      }
    }
    if (isPrivate && !request['user']) {
      throw new UnauthorizedException();
    }
    return true;
  }

  async validateToken(token: string) {
    if (!token) return null;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('VIEWTUBE_JWT_SECRET')
      });
      return payload;
    } catch {
      return null;
    }
  }

  private extractAccessTokenFromCookie(request: FastifyRequest): string | undefined {
    return request.cookies ? request.cookies.AccessToken : undefined;
  }

  private extractRefreshTokenFromCookie(request: FastifyRequest): string | undefined {
    return request.cookies ? request.cookies.RefreshToken : undefined;
  }
}
