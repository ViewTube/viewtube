import { Module } from '@nestjs/common';
import { CaptchaModule } from '../captcha/captcha.module';
import { UserModule } from '../../user/user.module';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';

@Module({
  providers: [RegisterService],
  controllers: [RegisterController],
  imports: [CaptchaModule, UserModule],
  exports: [RegisterService]
})
export class RegisterModule {}
