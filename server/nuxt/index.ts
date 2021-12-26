import { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import { importNuxtHandler } from './importer';

export type NuxtHandlerType = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export default class NuxtHandler {
  private handler: NuxtHandlerType;
  public nuxtHandler: NuxtHandlerType;

  public async getHandler(): Promise<NuxtHandlerType> {
    if (!this.handler) {
      let clientDir: string;
      if (process.env.VIEWTUBE_BASE_DIR) {
        clientDir = path.join(process.env.VIEWTUBE_BASE_DIR, 'client/');
      }
      const nuxtHandler: NuxtHandlerType = await importNuxtHandler(clientDir);
      this.handler = nuxtHandler;
      console.log('imported nuxt');
    }

    return this.handler;
  }
}
