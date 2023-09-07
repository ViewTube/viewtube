import { SetMetadata } from '@nestjs/common';

export const BYPASS_AUTH_KEY = 'bypassAuth';
export const BypassAuth = () => SetMetadata(BYPASS_AUTH_KEY, true);
