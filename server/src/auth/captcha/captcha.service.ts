import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import captcha from 'svg-captcha';
import miniSVG from 'mini-svg-data-uri';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Consola from 'consola';
import { Captcha } from './schemas/captcha.schema';
import { CaptchaDto } from './dto/captcha.dto';

@Injectable()
export class CaptchaService {
  constructor(
    @InjectModel(Captcha.name)
    private readonly CaptchaModel: Model<Captcha>
  ) {}

  async getCaptcha(): Promise<CaptchaDto> {
    const { data, text } = captcha.create({ size: 6, noise: 2, color: true });

    const clientToken = randomBytes(32).toString('hex');

    const createdCaptcha = new this.CaptchaModel({
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
    return this.CaptchaModel.findOne({ clientToken: token })
      .exec()
      .then(
        (value: Captcha) => {
          if (value && value.solution === solution) {
            return true;
          }
          return false;
        },
        _ => {
          return false;
        }
      );
  }

  deleteCaptcha(token: string): void {
    this.CaptchaModel.deleteOne({ clientToken: token })
      .exec()
      .catch(() => Consola.error('Error deleting captcha'));
  }
}
