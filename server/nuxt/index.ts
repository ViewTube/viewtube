import { Nuxt } from '@nuxt/core';
import { BundleBuilder } from '@nuxt/webpack';
import { Builder } from '@nuxt/builder';
import config from '../../nuxt.config.js';

export default class NuxtServer {
  private static instance: NuxtServer;
  public nuxt: Nuxt;

  public async run(shouldBuild = true): Nuxt {
    const nuxt = new Nuxt(config);

    // Build only in dev mode
    if (config.dev && shouldBuild) {
      const builder = new Builder(nuxt, BundleBuilder);
      const res = await builder.build();

      this.nuxt = res.nuxt;

      return res.nuxt;
    }

    if (this.nuxt) {
      return this.nuxt;
    }

    return nuxt;
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