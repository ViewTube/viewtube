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

  async proxyStream(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const originUrl = request.query['originUrl'];

    if (!originUrl) {
      reply.code(400).send({
        statusCode: 400,
        message: `originUrl is required.`,
        error: 'Bad Request'
      });
    }

    const streamProxyUrl = `${originUrl}/api/proxy/stream?originUrl=${encodeURIComponent(originUrl)}`;

    try {
      const rawHeaders = request.raw.headers;
      const headers = {
        range: rawHeaders.range,
        'user-agent': rawHeaders['user-agent'],
        origin: 'https://www.youtube.com'
      };

      const urlToFetch = new URL(request.query['url'] as string);

      const streamResponse = await vtFetch(urlToFetch, { headers, useProxy: true });

      if (streamResponse.headers['location']) {
        reply.header('location', `${streamProxyUrl}&url=${streamResponse.headers['location']}`);
      }

      if (urlToFetch.href.endsWith('.m3u8')) {
        const responseText = await streamResponse.body.text();
        const rewrittenResponse = responseText.replace(
          /https:\/\/.*?.googlevideo\.com\/.*?\.m3u8/gi,
          (match: string) => {
            return `${streamProxyUrl}&url=${encodeURIComponent(match)}`;
          }
        );
        reply.status(streamResponse.statusCode).send(rewrittenResponse);
      } else {
        reply.status(streamResponse.statusCode).send(streamResponse.body);
      }
    } catch (error) {
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.logger.log(error);
      }
    }
  }
}
