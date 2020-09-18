import { Controller, UseGuards, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'server/auth/guards/jwt.guard';
import webPush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
    @Req() req: any
  ): Promise<void> {
    const storedSubscription = await this.notificationsService.createNotificationsSubscription(
      subscription,
      req.user.username
    );

    const payload = JSON.stringify({
      title: 'Notifications enabled',
      body: 'ViewTube subscription notifications enabled'
    });

    webPush
      .sendNotification(storedSubscription, payload)
      .then()
      .catch(err => console.log('error', err));
  }
}
