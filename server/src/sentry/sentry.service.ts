import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { init, close, NodeOptions } from '@sentry/node';
import { logger } from 'server/logger';

@Injectable()
export class SentryService implements OnApplicationShutdown {
  private readonly sentryConfig: NodeOptions;
  private static sentryServiceInstance: SentryService;

  constructor(@Inject('SENTRY_OPTIONS') sentryOptions?: NodeOptions) {
    if (sentryOptions.enabled) {
      if (!sentryOptions.dsn) {
        logger.error('Invalid sentry config');
      }
      this.sentryConfig = sentryOptions;
      init(this.sentryConfig);
    }
  }

  public static SentryServiceInstance(): SentryService {
    if (!this.sentryServiceInstance) {
      this.sentryServiceInstance = new SentryService();
    }
    return this.sentryServiceInstance;
  }

  async onApplicationShutdown(_signal?: string) {
    if (SentryService.sentryServiceInstance) {
      await close();
    }
  }
}
