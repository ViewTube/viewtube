import { Controller, Post, UseGuards, Body, Res, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { UserDto } from '../user/user.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Res() reply: FastifyReply, @Body() user: UserDto, @Query('local') isLocal: boolean) {
    const cookie = this.authService.getJwtCookie(user.username);
    reply.header('Set-Cookie', cookie);
    const tokenResponse = this.authService.login(user.username);
    if (isLocal) {
      reply.send(tokenResponse);
    } else {
      reply.code(204).send();
    }
  }

  @Post('logout')
  logout(@Res() reply: FastifyReply) {
    const cookie = this.authService.getDeletionCookie();
    reply.header('Set-Cookie', cookie).code(204).send();
  }
}
