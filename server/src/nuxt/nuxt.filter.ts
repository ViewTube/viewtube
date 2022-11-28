import {
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  Catch,
  NotFoundException
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { NodeListener } from 'h3';

type ErrorResponse = string | { message: string; error?: string; ignoreFilter?: boolean };

@Catch(NotFoundException)
export class NuxtFilter implements ExceptionFilter {
  nuxtListener: NodeListener = null;

  public async init() {
    let nuxtDir = '../../../../client/.output/server/index.mjs';
    if (process.env.VIEWTUBE_BASE_DIR) {
      nuxtDir = `${process.env.VIEWTUBE_BASE_DIR}/client/.output/server/index.mjs`;
    }
    const nuxt = await import(/* webpackIgnore: true */ nuxtDir);
    if (!nuxt?.listener || typeof nuxt.listener !== 'function') {
      throw new Error('Nuxt listener not found');
    }
    this.nuxtListener = nuxt.listener;
  }

  public async catch(exception: HttpException, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const res = httpContext.getResponse<FastifyReply>();
    const req = httpContext.getRequest<FastifyRequest>();
    let status = null;
    try {
      status = exception.getStatus();
    } catch (_) {
      // Consola.error(exception);
    }

    const exceptionResponse = exception.getResponse() as ErrorResponse;
    const ignoreFilter = typeof exceptionResponse === 'object' && exceptionResponse?.ignoreFilter;

    if (status === 404 && !ignoreFilter) {
      this.nuxtListener(req.raw, res.raw);
    } else if (status) {
      if (typeof exceptionResponse === 'object') {
        delete exceptionResponse.ignoreFilter;
      }
      res.status(status).send(exceptionResponse);
    } else {
      res.code(500).send();
    }
  }
}
