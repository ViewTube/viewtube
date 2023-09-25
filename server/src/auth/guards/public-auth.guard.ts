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

    console.log('does i has refresh token', refreshToken);
    console.log('does i has access token', accessToken);
    console.log('where do i come from', targets);

    if (refreshToken) {
      const accessPayload = await this.validateToken(accessToken);

      if (!accessPayload) {
        const session = await this.SessionModel.findOne({ refreshToken }).exec();

        if (!session) {
          if (isPrivate) {
            throw new UnauthorizedException();
          }
          return true;
        }

        const newAccessToken = await this.jwtService.signAsync(
          { username: session.username },
          {
            secret: this.configService.get('VIEWTUBE_JWT_SECRET')
          }
        );

        await this.SessionModel.findOneAndUpdate(
          { refreshToken },
          {
            expiresAt: Date.now()
          }
        ).exec();

        const secure = this.configService.get('NODE_ENV') === 'production' && isHttps();
        setAuthCookies({
          reply,
          accessToken: newAccessToken,
          secure
        });

        request['user'] = { username: session.username };
      } else {
        request['user'] = accessPayload;
      }
    }
    if (isPrivate && !request['user']) {
      throw new UnauthorizedException();
    }
    console.log('where do i go', request['user']);
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
