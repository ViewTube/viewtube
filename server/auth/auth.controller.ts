import { Controller, Post, UseGuards, Body, Res } from '@nestjs/common';
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
  async login(@Res() response: Response, @Body() user: UserDto) {
    const cookie = await this.authService.getJwtCookie(user.username);
    response.setHeader('Set-Cookie', cookie);
    response.send(await this.authService.login(user.username));
    // return this.authService.login(user.username);
  }

  @Post('logout')
  logout(@Res() response: Response) {
    const cookie = this.authService.getDeletionCookie();
    response.setHeader('Set-Cookie', cookie);
    response.status(200).send();
  }
}
