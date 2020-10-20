import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaptchaService } from './captcha.service';
import { Captcha, CaptchaSchema } from './schemas/captcha.schema';
import { CaptchaController } from './captcha.controller';

@Module({
  providers: [CaptchaService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Captcha.name,
        schema: CaptchaSchema,
        collection: 'captchas'
      }
    ])
  ],
  controllers: [CaptchaController],
  exports: [CaptchaService]
})
export class CaptchaModule {}
