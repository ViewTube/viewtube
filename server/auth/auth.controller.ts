import { Controller, Post, UseGuards, Body, Res, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserDto } from '../user/user.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Res() response: Response, @Body() user: UserDto, @Query('local') isLocal: boolean) {
    const cookie = this.authService.getJwtCookie(user.username);
    response.setHeader('Set-Cookie', cookie);
    const tokenResponse = this.authService.login(user.username);
    if (isLocal) {
      response.send(tokenResponse);
    } else {
      response.sendStatus(204);
    }
  }

  @Post('logout')
  logout(@Res() response: Response) {
    const cookie = this.authService.getDeletionCookie();
    response.setHeader('Set-Cookie', cookie);
    response.status(200).send();
  }
}
