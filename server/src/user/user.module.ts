import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from 'server/auth/schemas/session.schema';
import { CacheConfigService } from 'server/cache-config.service';
import { HistoryModule } from './history/history.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User, UserSchema } from './schemas/user.schema';
import { SettingsModule } from './settings/settings.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const moduleMetadata: ModuleMetadata = {
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: 'users'
      },
      {
        name: Session.name,
        schema: SessionSchema,
        collection: 'sessions'
      }
    ]),
    CacheModule.registerAsync({
      useClass: CacheConfigService
    }),
    SubscriptionsModule,
    NotificationsModule,
    SettingsModule,
    HistoryModule
  ],
  providers: [UserService, Logger],
  controllers: [UserController],
  exports: [UserService]
};
@Module(moduleMetadata)
export class UserModule {}
