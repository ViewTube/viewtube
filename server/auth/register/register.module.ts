import { Module, ModuleMetadata } from '@nestjs/common';
import { CaptchaModule } from '../captcha/captcha.module';
import { UserModule } from '../../user/user.module';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';

const moduleMetadata: ModuleMetadata = {
  providers: [RegisterService],
  controllers: [RegisterController],
  imports: [CaptchaModule, UserModule],
  exports: [RegisterService]
};
@Module(moduleMetadata)
export class RegisterModule {}
