import { Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerSettings, ServerSettingsSchema } from 'server/admin/schemas/server-settings';
import { UserModule } from '../../user/user.module';
import { CaptchaModule } from '../captcha/captcha.module';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';

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
