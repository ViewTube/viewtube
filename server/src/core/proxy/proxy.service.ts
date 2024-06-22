import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { vtFetch } from 'server/common/vtFetch';

@Injectable()
export class ProxyService {
  constructor(
    private configService: ConfigService,
    private readonly logger: Logger
  ) {}

  allowedTextUrls = ['https://www.youtube.com/api/timedtext'];

  async proxyText(url: string, reply: FastifyReply): Promise<void> {
    const urlToProxy = new URL(url);

    if (this.allowedTextUrls.some(allowedUrl => urlToProxy.href.startsWith(allowedUrl))) {
      const textResponse = await vtFetch(urlToProxy.href, { useProxy: true });
      textResponse.body.pipe(reply.raw);
    } else {
      reply.code(403).send({
        statusCode: 403,
        message: `Url ${url} is not allowed to be proxied.`,
        error: 'Forbidden'
      });
    }
  }

  async proxyImage(url: string, reply: FastifyReply): Promise<void> {
    try {
      const imageResponse = await vtFetch(url, { useProxy: true });

      imageResponse.body.pipe(reply.raw);
    } catch (error) {
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.logger.log(error);
      }
    }
  }

  async proxyStream(url: string, request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const rawHeaders = request.raw.headers;
      const headers = {
        range: rawHeaders.range,
        'accept-language': rawHeaders['accept-language'],
        'user-agent': rawHeaders['user-agent'],
        origin: 'https://www.youtube.com'
      };
      const streamResponse = await vtFetch(url, { headers, useProxy: true });

      if (streamResponse.headers['location']) {
        if (request.query['originUrl']) {
          const originUrl = request.query['originUrl'];
          reply.header(
            'location',
            `${originUrl}/api/proxy/stream?originUrl=${originUrl}&url=${streamResponse.headers['location']}`
          );
        }
      }

      reply.status(streamResponse.statusCode).send(streamResponse.body);
    } catch (error) {
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.logger.log(error);
      }
    }
  }
}
