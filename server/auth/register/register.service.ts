import { Injectable, HttpException } from '@nestjs/common';
import { RegistrationDto } from './dto/registration.dto';
import { CaptchaService } from '../captcha/captcha.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class RegisterService {
  constructor(private captchaService: CaptchaService, private userService: UserService) { }

  async registerUser(userRegistration: RegistrationDto) {
    const captchaVerified: boolean = await this.captchaService
      .validateCaptcha(userRegistration.captchaToken, userRegistration.captchaSolution);
    if (captchaVerified) {
      this.captchaService.deleteCaptcha(userRegistration.captchaToken);
      return this.userService.create({
        username: userRegistration.username,
        password: userRegistration.password
      });
    } else {
      throw new HttpException('Captcha invalid. Solution is incorrect, timeout has expired or captcha has been submitted multiple times.', 403);
    }
  }
}
