import { Nuxt } from '@nuxt/core';
import { loadNuxt } from '@nuxt/core';
import { BundleBuilder } from '@nuxt/webpack';
import { Builder } from '@nuxt/builder';

export default class NuxtServer {
  private static instance: NuxtServer;
  public nuxtInstance: Nuxt;

  public async run(dev = true): Nuxt {
    let nuxtInstance: Nuxt;

    // Build only in dev mode
    if (dev) {
      nuxtInstance = await loadNuxt({ for: 'dev', rootDir: '../client' });
      await nuxtInstance.ready();
      const builder = new Builder(nuxtInstance, BundleBuilder);
      const res = await builder.build();

      this.nuxtInstance = res.nuxt;

      return res.nuxt;
    } else {
      nuxtInstance = await loadNuxt({
        for: 'start',
        rootDir: '../client',
        configFile: '../client/nuxt.config.ts'
      });
    }

    if (this.nuxtInstance) {
      return this.nuxtInstance;
    }

    return nuxtInstance;
  }

  public static getInstance(): NuxtServer {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new NuxtServer();
      return this.instance;
    }
  }
}
