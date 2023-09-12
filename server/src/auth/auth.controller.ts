import { Controller, Post, Body, Res, Query, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('deviceName') deviceName: string
  ) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    await this.authService.login(reply, user.username, deviceName);
    reply.code(204);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) reply: FastifyReply) {
    this.authService.logout(reply);
    reply.code(204);
  }
}
