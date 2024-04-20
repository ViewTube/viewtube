import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Model } from 'mongoose';
import { isHttps } from 'viewtube/shared';
import { BYPASS_AUTH_KEY } from '../decorators/bypass-auth.decorator';
import { IS_PRIVATE_KEY } from '../decorators/private.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Session } from '../schemas/session.schema';
import { setAuthCookies } from '../set-auth-cookies';

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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);

    let isPrivate = this.reflector.getAllAndOverride<boolean>(IS_PRIVATE_KEY, targets);
    let isBypassAuth = this.reflector.getAllAndOverride<boolean>(BYPASS_AUTH_KEY, targets);

    // If loginRequiredEverywhere is set to true, then all routes are private by default
    if (global.requireLoginEverywhere === true) {
      isPrivate = true;
      isBypassAuth = false;
    }

    if (isBypassAuth) return true;
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const accessToken = this.extractAccessTokenFromCookie(request);
    const refreshToken = this.extractRefreshTokenFromCookie(request);

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
