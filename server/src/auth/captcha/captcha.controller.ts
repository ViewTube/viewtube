import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CaptchaService } from './captcha.service';

import { Public } from '../decorators/public.decorator';
import type { CaptchaDto } from './dto/captcha.dto';

@ApiTags('Auth')
@Controller('auth')
export class CaptchaController {
  constructor(private captchaService: CaptchaService) {}

  @Get('captcha')
  @Public()
  @ApiOperation({ summary: 'Get a captcha' })
  getCaptcha(): Promise<CaptchaDto> {
    return this.captchaService.getCaptcha();
  }
}
