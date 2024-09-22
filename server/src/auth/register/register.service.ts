import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServerSettings } from 'server/admin/schemas/server-settings';
import { UserService } from '../../user/user.service';
import { CaptchaService } from '../captcha/captcha.service';
import { RegistrationDto } from './dto/registration.dto';

@Injectable()
export class RegisterService {
  constructor(
    private captchaService: CaptchaService,
    private userService: UserService,
    @InjectModel(ServerSettings.name)
    private readonly ServerSettingsModel: Model<ServerSettings>
  ) {}

  async registerUser(userRegistration: RegistrationDto) {
    const serverSettings = await this.ServerSettingsModel.findOne({ version: 1 }).exec();
    if (serverSettings?.registrationEnabled === false) {
      throw new HttpException('Admin has disabled registration for this server', 403);
    }
    const captchaVerified: boolean = await this.captchaService.validateCaptcha(
      userRegistration.captchaToken,
      userRegistration.captchaSolution
    );
    if (!captchaVerified) {
      throw new HttpException(
        'Captcha invalid. Possible causes:\n- Solution is incorrect.\n- Timeout has expired\n- Captcha has been submitted multiple times',
        403
      );
    }
    this.captchaService.deleteCaptcha(userRegistration.captchaToken);
    return this.userService.create({
      username: userRegistration.username,
      password: userRegistration.password
    });
  }
}
