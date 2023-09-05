import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PRIVATE_KEY } from '../decorators/private.decorator';
import { validate } from 'webpack';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class PublicAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPrivate = this.reflector.getAllAndOverride<boolean>(IS_PRIVATE_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const accessToken = this.extractAccessTokenFromCookie(request);
    const refreshToken = this.extractRefreshTokenFromCookie(request);

    if (accessToken && refreshToken) {
      const accessPayload = await this.validateAccessToken(accessToken);
      if (!accessPayload) {
        const refreshPayload = await this.validateAccessToken(refreshToken);
        if (!refreshPayload) {
          if (isPrivate) {
            throw new UnauthorizedException();
          }
          return true;
        } else {
          const refreshToken = await this.jwtService.signAsync(
            {
              username: refreshPayload.username
            },
            {
              expiresIn: '7d'
            }
          );
          const accessToken = await this.jwtService.signAsync({
            username: refreshPayload.username
          });

          
        }
      }
      request['user'] = accessPayload;
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('VIEWTUBE_JWT_SECRET'),
        issuer: 'viewtube-api',
        audience: 'viewtube-web'
      });

      request['user'] = payload;
    } catch {
      if (isPrivate) {
        throw new UnauthorizedException();
      }
    }
    return true;
  }

  async validateAccessToken(accessToken: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('VIEWTUBE_JWT_SECRET'),
        issuer: 'viewtube-api',
        audience: 'viewtube-web'
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
