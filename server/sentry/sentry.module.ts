import { DynamicModule, Module } from '@nestjs/common';
import * as SentryTypes from '@sentry/types';
import { SentryService } from './sentry.service';

@Module({})
export class SentryModule {
  static forRoot(options: SentryTypes.Options): DynamicModule {
    return {
      module: SentryModule,
      providers: [
        {
          provide: 'SENTRY_OPTIONS',
          useValue: options
        },
        SentryService
      ],
      exports: [SentryService]
    };
  }
}
