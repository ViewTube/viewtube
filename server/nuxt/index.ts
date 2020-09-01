import { Nuxt, Builder } from 'nuxt';
import { BundleBuilder } from '@nuxt/webpack';
import config from '../../nuxt.config.js';

export default class NuxtServer {
  private static instance: NuxtServer;
  public nuxt: Nuxt;

  public async run(shouldBuild = true): Nuxt {
    const dev = process.env.NODE_ENV !== 'production';
    const nuxt = new Nuxt({...config, dev });

    // Build only in dev mode
    if (dev && shouldBuild) {
      console.log('Building nuxt')
      const builder = new Builder(nuxt, BundleBuilder);
      const res = await builder.build();

      this.nuxt = res.nuxt;

      return res.nuxt;
    } else {
      console.log('Not building nuxt ' + dev);
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