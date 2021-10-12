import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Options } from '@sentry/types';
import Sentry from '@sentry/node';
import Consola from 'consola';

@Injectable()
export class SentryService implements OnApplicationShutdown {
  private readonly sentryConfig: Options;
  private static sentryServiceInstance: SentryService;

  constructor(@Inject('SENTRY_OPTIONS') sentryOptions?: Options) {
    if (sentryOptions.enabled) {
      if (!sentryOptions.dsn) {
        Consola.error('Invalid sentry config');
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
