import { Injectable, HttpException } from '@nestjs/common';
import { CaptchaService } from '../captcha/captcha.service';
import { UserService } from '../../user/user.service';
import { RegistrationDto } from './dto/registration.dto';

@Injectable()
export class RegisterService {
  constructor(
    private captchaService: CaptchaService,
    private userService: UserService
  ) {}

  async registerUser(userRegistration: RegistrationDto) {
    if (global.registrationEnabled === false) {
      throw new HttpException('Admin has disabled registration for this server', 403);
    }
    const captchaVerified: boolean = await this.captchaService.validateCaptcha(
      userRegistration.captchaToken,
      userRegistration.captchaSolution
    );
    if (captchaVerified) {
      this.captchaService.deleteCaptcha(userRegistration.captchaToken);
      return this.userService.create({
        username: userRegistration.username,
        password: userRegistration.password
      });
    } else {
      throw new HttpException(
        'Captcha invalid. Possible causes:\n- Solution is incorrect.\n- Timeout has expired\n- Captcha has been submitted multiple times',
        403
      );
    }
  }
}
