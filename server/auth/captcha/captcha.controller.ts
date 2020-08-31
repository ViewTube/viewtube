import { Controller, Get } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { CaptchaDto } from './dto/captcha.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class CaptchaController {
  constructor(private captchaService: CaptchaService) { }

  @Get('captcha')
  @ApiOperation({ summary: 'Get a captcha' })
  async getCaptcha(): Promise<CaptchaDto> {
    return this.captchaService.getCaptcha();
  }
}
