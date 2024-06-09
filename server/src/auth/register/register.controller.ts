import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { RegistrationDto } from './dto/registration.dto';
import { RegisterService } from './register.service';

@ApiTags('Auth')
@Controller('auth')
export class RegisterController {
  constructor(private registerService: RegisterService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: `Request a captcha through the /auth/captcha endpoint,
    and pass its token and solution alongside the new user's credentials.`
  })
  @Public()
  @Post('register')
  registerUser(@Body() user: RegistrationDto): Promise<any> {
    return this.registerService.registerUser(user);
  }
}
