import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import miniSVG from 'mini-svg-data-uri';
import { Model } from 'mongoose';
import captcha from 'svg-captcha';
import { CaptchaDto } from './dto/captcha.dto';
import { Captcha } from './schemas/captcha.schema';

@Injectable()
export class CaptchaService {
  constructor(
    @InjectModel(Captcha.name)
    private readonly CaptchaModel: Model<Captcha>,
    private readonly logger: Logger
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
          return value && value.solution === solution;
        },
        () => {
          return false;
        }
      );
  }

  deleteCaptcha(token: string): void {
    this.CaptchaModel.deleteOne({ clientToken: token })
      .exec()
      .catch(() => this.logger.error('Error deleting captcha'));
  }
}
