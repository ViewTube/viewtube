import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { CaptchaModule } from '../captcha/captcha.module';
import { UserModule } from '../../user/user.module';

@Module({
  providers: [RegisterService],
  controllers: [RegisterController],
  imports: [CaptchaModule, UserModule],
  exports: [RegisterService]
})
export class RegisterModule {}
