import {
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  Catch,
} from '@nestjs/common';
import { Nuxt } from 'nuxt';

@Catch()
export class NuxtFilter implements ExceptionFilter {
  private readonly nuxt: Nuxt;

  constructor(nuxt: Nuxt) {
    this.nuxt = nuxt;
  }

  public async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = exception.getStatus();

    if (status === 404) {
      if (!res.headersSent) {
        await this.nuxt.render(req, res);
      }
    } else {
      res.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
    }
  }
}