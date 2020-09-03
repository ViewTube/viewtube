import { Injectable } from '@nestjs/common';
import captcha from 'trek-captcha';
import { InjectModel } from '@nestjs/mongoose';
import { Captcha } from './schemas/captcha.schema';
import { CaptchaDto } from './dto/captcha.dto';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto'

@Injectable()
export class CaptchaService {
  constructor(
    @InjectModel(Captcha.name) private readonly captchaModel: Model<Captcha>
  ) { }

  async getCaptcha(): Promise<CaptchaDto> {
    const { token, buffer } = await captcha({ size: 6 });

    const clientToken = randomBytes(32).toString('hex');
    const captchaImage = buffer.toString('base64');

    const createdCaptcha = new this.captchaModel({
      clientToken,
      solution: token,
    });
    await createdCaptcha.save();

    const captchaResponse: CaptchaDto = {
      token: clientToken,
      captchaImage: `data:image/gif;base64,${captchaImage}`
    };

    return captchaResponse;
  }

  validateCaptcha(token: string, solution: string): Promise<boolean> {
    return this.captchaModel
      .findOne({ clientToken: token })
      .exec().then((value: Captcha) => {
        if (value && value.solution === solution) {
          return true;
        }
        return false;
      }, (err) => {
        console.error(err);
        return false;
      });
  }

  deleteCaptcha(token: string): void {
    this.captchaModel.deleteOne({ clientToken: token }).exec().then(console.log, console.error);
  }
}
