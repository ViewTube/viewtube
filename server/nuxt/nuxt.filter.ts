import { ExceptionFilter, HttpException, ArgumentsHost, Catch } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Nuxt } from '@nuxt/core';

@Catch()
export class NuxtFilter implements ExceptionFilter {
  private readonly nuxt: Nuxt;

  constructor(nuxt: Nuxt) {
    this.nuxt = nuxt;
  }

  public async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest<FastifyRequest>();
    let status = null;
    try {
      status = exception.getStatus();
    } catch (_) {
      // Consola.error(exception);
    }

    if (status === 404 && !(exception.getResponse() as any).ignoreFilter) {
      await this.nuxt.render(req.raw, res.raw);
    } else if (status) {
      const response = exception.getResponse();
      delete (response as any).ignoreFilter;
      res.status(status).send(response);
    } else {
      res.code(500).send();
    }
  }
}
