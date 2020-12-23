import { Module, ModuleMetadata } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from './notifications/notifications.module';
import { User, UserSchema } from './schemas/user.schema';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ThemeModule } from './theme/theme.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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
    ThemeModule
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
};
@Module(moduleMetadata)
export class UserModule {}
