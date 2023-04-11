import { Logger, Module, ModuleMetadata } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheConfigService } from 'server/cache-config.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { HistoryModule } from './history/history.module';
import { AdminModule } from './admin/admin.module';

const moduleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: 'users'
      }
    ]),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    SubscriptionsModule,
    NotificationsModule,
    SettingsModule,
    HistoryModule,
    AdminModule
  ],
  providers: [UserService, Logger],
  controllers: [UserController],
  exports: [UserService]
};
@Module(moduleMetadata)
export class UserModule {}
