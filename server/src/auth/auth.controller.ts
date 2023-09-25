import { Controller, Post, Body, Res, UnauthorizedException, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
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
    @Body('deviceName') deviceName: string,
    @Body('deviceType') deviceType: string
  ) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    await this.authService.login(reply, user.username, deviceName, deviceType);
    reply.code(204);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) reply: FastifyReply, @Req() request: FastifyRequest) {
    this.authService.logout(reply, request);
  }
}
