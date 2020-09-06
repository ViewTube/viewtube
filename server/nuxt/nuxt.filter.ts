import {
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  Catch,
} from '@nestjs/common';
import { Nuxt } from 'nuxt';
import { Response } from 'express';

@Catch()
export class NuxtFilter implements ExceptionFilter {
  private readonly nuxt: Nuxt;

  constructor(nuxt: Nuxt) {
    this.nuxt = nuxt;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    const req = ctx.getRequest();
    const status = exception.getStatus();

    if (
      status === 404 &&
      !res.headersSent &&
      !exception.getResponse()['ignoreFilter']
    ) {
      await this.nuxt.render(req, res);
    } else {
      const response = exception.getResponse();
      delete response['ignoreFilter'];
      res.status(status).json(response);
    }
  }
}
