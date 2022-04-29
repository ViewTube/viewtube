import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterService } from './register.service';
import { RegistrationDto } from './dto/registration.dto';

@ApiTags('Auth')
@Controller('auth')
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: `Request a captcha through the /auth/captcha endpoint,
    and pass its token and solution alongside the new user's credentials.`
  })
  @Post('register')
  registerUser(@Body() user: RegistrationDto): Promise<any> {
    return this.registerService.registerUser(user);
  }
}
