import { Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Captcha, CaptchaSchema } from './schemas/captcha.schema';
import { CaptchaController } from './captcha.controller';

@Module({
  providers: [CaptchaService],
  imports: [
    MongooseModule.forFeature([
      { name: Captcha.name, schema: CaptchaSchema, collection: 'captchas' },
    ])
  ],
  controllers: [CaptchaController],
  exports: [CaptchaService]
})
export class CaptchaModule { }
