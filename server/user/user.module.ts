import { Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { HistoryModule } from './history/history.module';

const moduleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: 'users'
      }
    ]),
    SubscriptionsModule,
    NotificationsModule,
    SettingsModule,
    HistoryModule
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
};
@Module(moduleMetadata)
export class UserModule {}
