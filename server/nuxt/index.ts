import path from 'path';
import { Nuxt } from '@nuxt/core';
import { loadNuxt } from '@nuxt/core';

export default class NuxtServer {
  private static instance: NuxtServer;
  public nuxtInstance: Nuxt;

  public async run(): Nuxt {
    let clientDir = '../client';
    if (process.env.VIEWTUBE_BASE_DIR) {
      clientDir = path.join(process.env.VIEWTUBE_BASE_DIR, 'client/');
    }
    const nuxtInstance: Nuxt = await loadNuxt({
      for: 'start',
      rootDir: clientDir,
      configFile: `${clientDir}/nuxt.config.ts`
    });

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
