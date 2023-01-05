import { PWAOptions } from '@nuxtjs/pwa';

declare module '#app' {
  interface PageMeta {
    headless?: boolean;
  }
}

declare module 'nuxt/config' {
  interface NuxtConfig {
    pwa?: any;
  }
}

export {};
