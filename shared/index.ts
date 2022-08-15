export { SponsorBlockSegmentsDto } from './dto/sponsorblock/sponsorblock-segments.dto';
export { SponsorBlockSegmentDto } from './dto/sponsorblock/sponsorblock-segment.dto';
export { getSecondsFromTimestamp, getApiUrl, getViewtubeDomain, isHttps } from './util';
export { ApiErrorDto } from './dto/api/error.dto';
import { components, external, operations, paths } from './api.schema';

export type ApiDto<T extends keyof components['schemas']> = components['schemas'][T];

