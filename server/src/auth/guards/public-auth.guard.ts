import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PRIVATE_KEY } from '../decorators/private.decorator';

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

    const request = context.switchToHttp().getRequest();
    let token = this.extractTokenFromHeader(request);
    if (!token) {
      token = this.extractTokenFromCookie(request);
    }
    if (!token) {
      if (isPrivate) {
        throw new UnauthorizedException();
      }
      return true;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
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

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies ? request.cookies.Authentication : undefined;
  }
}
