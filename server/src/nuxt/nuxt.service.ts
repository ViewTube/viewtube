import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { createReadStream } from 'fs';
import { NodeListener } from 'h3';
import path from 'path';
import { resolveNuxtPath } from './nuxt.resolver';
import mime from 'mime-types';

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
    this.nuxtListener(request.raw, reply.raw);
  }

  getMimeType(filename: string) {
    return mime.lookup(filename) || 'application/octet-stream';
  }

  getStaticNuxtFile(reply: FastifyReply, filename: string): void {
    const nuxtStaticPath = path.join(this.nuxtPath, 'public', '_nuxt');
    // Get mime type from filename
    const mimeType = this.getMimeType(filename);
    reply.header('Content-Type', mimeType);
    const file = createReadStream(path.join(nuxtStaticPath, filename));
    file.pipe(reply.raw);
  }
}
