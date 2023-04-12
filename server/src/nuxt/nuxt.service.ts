import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { NodeListener } from 'h3';
import { resolveNuxtPath } from './nuxt.resolver';

const importerFunction = new Function('module', 'return import(module)');

@Injectable()
export class NuxtService {
  constructor(private configService: ConfigService) {}

  nuxtListener: NodeListener = null;
  nuxtPath: string = null;

  async init() {
    this.nuxtListener = await this.importNuxtListener();
  }

  importNuxtListener = async (): Promise<NodeListener> => {
    this.nuxtPath = resolveNuxtPath();
    const nuxt = await importerFunction(`${this.nuxtPath}/server/index.mjs`);
    if (!nuxt?.listener || typeof nuxt.listener !== 'function') {
      throw new Error(
        'No compiled client found. Make sure to run "pnpm run build" inside the client folder before starting the server.'
      );
    }
    return nuxt.listener;
  };

  getPage(request: FastifyRequest, reply: FastifyReply): void {
    if (typeof this.nuxtListener === 'function') {
      this.nuxtListener(request.raw, reply.raw);
    } else {
      reply
        .code(404)
        .send({
          statusCode: 404,
          message: `Cannot ${request.method} ${request.url}`,
          error: 'Not Found'
        });
      // throw new NotFoundException();
    }
  }
}
