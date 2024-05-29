import type { components } from './api.schema';

export { ApiErrorDto } from './dto/api/error.dto';
export { getSecondsFromTimestamp, getTimestampFromSeconds, isHttps } from './util';

export type ApiDto<T extends keyof components['schemas']> = components['schemas'][T];
