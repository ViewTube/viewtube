import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { STATUS_CODES } from 'node:http';

type ApiError = {
  statusCode: number;
  message: string;
  description?: string;
  error: string;
};

const statusText = (statusCode: number): string => STATUS_CODES[statusCode] ?? 'Error';

const apiError = (statusCode: number, message?: string, description?: string): ApiError => ({
  statusCode,
  message: message ?? statusText(statusCode),
  ...(description ? { description } : {}),
  error: statusText(statusCode)
});

const messageFrom = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const entries = value.filter(entry => typeof entry === 'string');
    return entries.length ? entries.join('; ') : undefined;
  }
  return undefined;
};


const toApiError = (exception: unknown): ApiError => {
  if (!(exception instanceof HttpException)) {
    // Never echo an unknown error: it carries raw youtubei.js text and stack traces.
    return apiError(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  const statusCode = exception.getStatus();
  const response = exception.getResponse();

  if (typeof response === 'string') return apiError(statusCode, response);

  if (response instanceof Error || typeof response !== 'object' || response === null) {
    return apiError(statusCode);
  }

  const { message, description } = response as { message?: unknown; description?: unknown };

  return apiError(
    statusCode,
    messageFrom(message),
    typeof description === 'string' ? description : undefined
  );
};


@Catch()
export class ApiExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('ApiExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      super.catch(exception, host);
      return;
    }

    const request = host.switchToHttp().getRequest<FastifyRequest>();
    const reply = host.switchToHttp().getResponse<FastifyReply>();

    if (!request.url.startsWith('/api')) {
      super.catch(exception, host);
      return;
    }

    const error = toApiError(exception);

    if (reply.sent || reply.raw.headersSent) {
      this.log(request, exception, error, 'after the response had started');
      reply.raw.end();
      return;
    }

    this.log(request, exception, error);

    reply
      .removeHeader('cache-control')
      .header('cache-control', 'no-store')
      .code(error.statusCode)
      .type('application/json')
      .send(error);
  }

  private log(request: FastifyRequest, exception: unknown, error: ApiError, note?: string): void {
    const where = `${request.method} ${request.url}`;
    const what = `${error.statusCode} ${error.message}`;
    const suffix = note ? ` (${note})` : '';

    if (error.statusCode < HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.debug(`${where} → ${what}${suffix}`);
      return;
    }

    if (error.statusCode > HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.warn(`${where} → ${what}${suffix}${this.detailOf(exception, error)}`);
      return;
    }

    this.logger.error(
      `${where} → ${what}${suffix}${this.detailOf(exception, error)}`,
      exception instanceof Error ? exception.stack : String(exception)
    );
  }

  private detailOf(exception: unknown, error: ApiError): string {
    if (!(exception instanceof Error)) return '';
    return exception.message && exception.message !== error.message ? `: ${exception.message}` : '';
  }
}
