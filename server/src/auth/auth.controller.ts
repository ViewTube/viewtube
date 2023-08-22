import { Controller, Post, Body, Res, Query, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { UserDto } from '../user/user.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() { username, password }: UserDto,
    @Query('local') isLocal: boolean
  ) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const cookie = this.authService.getJwtCookie(user.username);
    reply.header('Set-Cookie', cookie);
    const tokenResponse = this.authService.login(user.username);
    if (isLocal) {
      return tokenResponse;
    } else {
      reply.code(204);
    }
  }

  @Post('logout')
  logout(@Res() reply: FastifyReply) {
    const cookie = this.authService.getDeletionCookie();
    reply.header('Set-Cookie', cookie).code(204).send();
  }
}
