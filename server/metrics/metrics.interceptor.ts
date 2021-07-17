import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tap } from 'rxjs';
import { ApiRequest } from './schemas/api-request.schema';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(ApiRequest.name)
    private readonly ApiRequestModel: Model<ApiRequest>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const dateBeforeRequest = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const requestDuration = Date.now() - dateBeforeRequest;
        const request = context.getArgByIndex(0);
        if (request) {
          const metricData = {
            url: request.url,
            params: request.params,
            requestDuration,
            timestamp: dateBeforeRequest
          };
          await this.ApiRequestModel.create(metricData);
        }
      })
    );
  }
}
