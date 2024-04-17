import { Injectable } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { NodeListener } from 'h3';
import { resolveNuxtPath, resolveStaticFileList } from './nuxt.resolver';

const importerFunction = new Function('module', 'return import(module)');

@Injectable()
export class NuxtService {
  nuxtListener: NodeListener = null;
  nuxtPath: string = null;
  staticFileList: Array<string> = [];

  async init() {
    this.nuxtListener = await this.importNuxtListener();
  }

  async importNuxtListener(): Promise<NodeListener> {
    this.nuxtPath = resolveNuxtPath();
    this.staticFileList = await resolveStaticFileList(this.nuxtPath);
    const nuxt = await importerFunction(`file://${this.nuxtPath}/server/index.mjs`);
    if (!nuxt?.listener || typeof nuxt.listener !== 'function') {
      throw new Error(
        'No compiled client found. Make sure to run "pnpm run build" inside the client folder before starting the server.'
      );
    }
    return nuxt.listener;
  }

  getPage(request: FastifyRequest, reply: FastifyReply): void {
    if (this.staticFileList.some(el => el.replaceAll('\\', '/') === request.url)) {
      let cacheTTL = 86400;
      if (request.url.includes('_nuxt')) {
        cacheTTL = 31536000;
      }
      reply.header('Cache-Control', `max-age=${cacheTTL}`).sendFile(request.url);
    } else if (typeof this.nuxtListener === 'function') {
      this.nuxtListener(request.raw, reply.raw);
    } else {
      reply.code(404).send({
        statusCode: 404,
        message: `Cannot ${request.method} ${request.url}`,
        error: 'Not Found'
      });
      // throw new NotFoundException();
    }
  }
}
