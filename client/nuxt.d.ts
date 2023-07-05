import { ModuleOptions } from 'nuxt-proxy';
import { NuxtAppConfig } from 'nuxt/schema';

declare module '#app' {
  interface PageMeta {
    headless?: boolean;
  }
}

export {};
