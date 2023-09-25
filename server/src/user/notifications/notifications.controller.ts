import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import webPush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { ViewTubeRequest } from 'server/common/viewtube-request';
import { NotificationsService } from './notifications.service';
import { Private } from 'server/auth/decorators/private.decorator';

@ApiTags('User')
@ApiBearerAuth()
@Private()
@Controller('user/notifications')
export class NotificationsController {
  constructor(
    private configService: ConfigService,
    private notificationsService: NotificationsService
  ) {}

  @ApiBearerAuth()
  @Post('subscribe')
  async subscribeToNotifications(
    @Body() subscription: webPush.PushSubscription,
    @Req() request: ViewTubeRequest
  ): Promise<void> {
    const storedSubscription = await this.notificationsService.createNotificationsSubscription(
      subscription,
      request.user.username
    );

    const payload = JSON.stringify({
      title: 'Notifications enabled',
      body: 'ViewTube subscription notifications enabled'
    });

    webPush
      .sendNotification(storedSubscription, payload)
      .then()
      .catch(() => {
        // Ignore silently
      });
  }
}
