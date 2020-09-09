import { Injectable } from '@nestjs/common';
import captcha from 'svg-captcha';
import miniSVG from 'mini-svg-data-uri';
import { InjectModel } from '@nestjs/mongoose';
import { Captcha } from './schemas/captcha.schema';
import { CaptchaDto } from './dto/captcha.dto';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';

@Injectable()
export class CaptchaService {
  constructor(
    @InjectModel(Captcha.name)
    private readonly captchaModel: Model<Captcha>
  ) {}

  async getCaptcha(): Promise<CaptchaDto> {
    const { data, text } = captcha.create({ size: 6, noise: 2, color: true });

    const clientToken = randomBytes(32).toString('hex');

    const createdCaptcha = new this.captchaModel({
      clientToken,
      solution: text
    });
    await createdCaptcha.save();

    const captchaResponse: CaptchaDto = {
      token: clientToken,
      captchaImage: miniSVG(data)
    };

    return captchaResponse;
  }

  validateCaptcha(token: string, solution: string): Promise<boolean> {
    return this.captchaModel
      .findOne({ clientToken: token })
      .exec()
      .then(
        (value: Captcha) => {
          if (value && value.solution === solution) {
            return true;
          }
          return false;
        },
        err => {
          console.error(err);
          return false;
        }
      );
  }

  deleteCaptcha(token: string): void {
    this.captchaModel.deleteOne({ clientToken: token }).exec().then(console.log, console.error);
  }
}
