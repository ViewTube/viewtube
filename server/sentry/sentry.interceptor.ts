import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable, tap } from 'rxjs';
import { SentryService } from './sentry.service';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpArguments = context.switchToHttp();
    const request = httpArguments.getRequest<FastifyRequest>();

    console.log(request.routerPath);

    const transaction = Sentry.startTransaction({
      op: 'request',
      name: request.routerPath
    });

    Sentry.withScope(scope => {
      scope.setSpan(transaction);

      const requestData = Sentry.Handlers.parseRequest({}, request.raw);

      scope.setExtra('req', requestData.request);
      if (requestData.extra) {
        scope.setExtras(requestData.extra);
      }
      if (requestData.user) {
        scope.setUser(requestData.user);
      }
    });

    return next.handle().pipe(
      tap({
        finalize: () => {
          const response = httpArguments.getResponse<FastifyReply>();
          console.log('complete with ' + response.statusCode);
          transaction.setHttpStatus(response.statusCode);
          transaction.finish();
        },
        error: error => {
          console.log('error');
          Sentry.captureException(error);
        }
      })
    );
  }
}
