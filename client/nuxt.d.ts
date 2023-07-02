import { ModuleOptions } from 'nuxt-proxy';

declare module '#app' {
  interface PageMeta {
    headless?: boolean;
  }
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    proxy?: ModuleOptions;
  }
}

export {};
