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

declare module 'vue-material-design-icons/*.vue' {
  import type { DefineComponent } from 'vue';

  const IconVue: DefineComponent<{
    /// `size` defaults to 24
    size: number;
    /// `fillColor` defaults to 'currentColor'
    fillColor: string;
    title?: string;
  }>;
  export default IconVue;
}

export {};
