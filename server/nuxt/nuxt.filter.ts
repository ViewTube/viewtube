import { ExceptionFilter, HttpException, ArgumentsHost, Catch } from '@nestjs/common';
import { Nuxt } from 'nuxt';
import { Response } from 'express';
// import Consola from 'consola';

@Catch()
export class NuxtFilter implements ExceptionFilter {
  private readonly nuxt: Nuxt;

  constructor(nuxt: Nuxt) {
    this.nuxt = nuxt;
  }

  public async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    const req = ctx.getRequest();
    let status = null;
    try {
      status = exception.getStatus();
    } catch (_) {
      // Consola.error(exception);
    }

    if (status === 404 && !res.headersSent && !(exception.getResponse() as any).ignoreFilter) {
      await this.nuxt.render(req, res);
    } else if (status) {
      const response = exception.getResponse();
      delete (response as any).ignoreFilter;
      res.status(status).json(response);
    } else {
      res.sendStatus(500);
    }
  }
}
