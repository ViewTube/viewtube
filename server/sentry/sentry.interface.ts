import { ModuleMetadata } from '@nestjs/common';
import * as SentryTypes from '@sentry/types';

export interface SentryModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<SentryTypes.Options> | SentryTypes.Options;
}
