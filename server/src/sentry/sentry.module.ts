import { DynamicModule, Module, Provider } from '@nestjs/common';
import { NodeOptions } from '@sentry/node';
import { SentryModuleAsyncOptions } from './sentry.interface';
import { SentryService } from './sentry.service';

@Module({})
export class SentryModule {
  static forRoot(options: NodeOptions): DynamicModule {
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

  static forRootAsync(options: SentryModuleAsyncOptions): DynamicModule {
    return {
      module: SentryModule,
      providers: [...this.createAsyncProviders(options), SentryService],
      exports: [SentryService]
    };
  }

  private static createAsyncProviders(options: SentryModuleAsyncOptions): Array<Provider> {
    if (options.useFactory) {
      return [
        {
          inject: options.inject || [],
          provide: 'SENTRY_OPTIONS',
          useFactory: options.useFactory
        }
      ];
    }
    throw new Error('Options other than factory not supported');
  }
}
