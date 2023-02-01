/* eslint-disable no-var */
import { fetch as _fetch } from 'undici/types/fetch';

declare global {
  var fetch: typeof _fetch;
  var __basedir: string;
}

export {};
