import { Module, ModuleMetadata } from '@nestjs/common';
import { CaptchaModule } from '../captcha/captcha.module';
import { UserModule } from '../../user/user.module';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerSettings, ServerSettingsSchema } from 'server/admin/schemas/server-settings';

const moduleMetadata: ModuleMetadata = {
  providers: [RegisterService],
  controllers: [RegisterController],
  imports: [
    CaptchaModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: ServerSettings.name,
        schema: ServerSettingsSchema,
        collection: 'server-settings'
      }
    ])
  ],
  exports: [RegisterService]
};
@Module(moduleMetadata)
export class RegisterModule {}
