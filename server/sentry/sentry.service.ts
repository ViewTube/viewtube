import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import * as SentryTypes from '@sentry/types';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService implements OnApplicationShutdown {
  private readonly sentryConfig: SentryTypes.Options;
  private static sentryServiceInstance: SentryService;

  constructor(@Inject('SENTRY_OPTIONS') sentryOptions?: SentryTypes.Options) {
    if (sentryOptions.enabled) {
      if (!(sentryOptions && sentryOptions.dsn)) {
        console.error('Invalid sentry config');
      }
      this.sentryConfig = sentryOptions;
      Sentry.init(this.sentryConfig);
    }
  }

  public static SentryServiceInstance(): SentryService {
    if (!this.sentryServiceInstance) {
      this.sentryServiceInstance = new SentryService();
    }
    return this.sentryServiceInstance;
  }

  async onApplicationShutdown(_signal?: string) {
    await Sentry.close();
  }
}
