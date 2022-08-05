import { ModuleMetadata } from '@nestjs/common';
import { NodeOptions } from '@sentry/node';

export interface SentryModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<NodeOptions> | NodeOptions;
}
