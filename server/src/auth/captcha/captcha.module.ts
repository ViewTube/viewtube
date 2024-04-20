import { Logger, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { Captcha, CaptchaSchema } from './schemas/captcha.schema';

const moduleMetadata: ModuleMetadata = {
  providers: [CaptchaService, Logger],
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
};
@Module(moduleMetadata)
export class CaptchaModule {}
