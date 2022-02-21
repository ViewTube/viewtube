import { ExceptionFilter, HttpException, ArgumentsHost, Catch } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { nuxtImporter } from './importNuxt.mjs';

@Catch()
export class NuxtFilter implements ExceptionFilter {
  nuxtFilter: any = null;

  public async init() {
    this.nuxtFilter = await nuxtImporter();
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
      await this.nuxtFilter.handle(req.raw, res.raw);
    } else if (status) {
      const response = exception.getResponse();
      delete (response as any).ignoreFilter;
      res.status(status).send(response);
    } else {
      res.code(500).send();
    }
  }
}
