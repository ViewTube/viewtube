import { Injectable, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  imageHostSuffixes,
  parseProxyTarget,
  streamHostSuffixes
} from 'server/common/proxy-allowlist';
import { vtFetch } from 'server/common/vtFetch';

@Injectable()
export class ProxyService {
  constructor(private readonly logger: Logger) {}

  allowedTextUrls = ['https://www.youtube.com/api/timedtext'];

  private rejectTarget(reply: FastifyReply, endpoint: string, error: string): void {
    this.logger.warn(`Blocked ${endpoint} proxy request: ${error}`);
    reply.code(403).type('application/json').send({
      statusCode: 403,
      message: error,
      error: 'Forbidden'
    });
  }

  private failUpstream(reply: FastifyReply, endpoint: string, host: string, error: unknown): void {
    this.logger.error(`${endpoint} proxy failed for ${host}`, error);
    if (reply.sent) return;
    reply
      .code(502)
      .type('application/json')
      .send({
        statusCode: 502,
        message: `Failed to proxy ${endpoint} from ${host}`,
        error: 'Bad Gateway'
      });
  }

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
    const target = parseProxyTarget(url, imageHostSuffixes());

    if (target.error) {
      this.rejectTarget(reply, 'image', target.error);
      return;
    }

    try {
      const imageResponse = await vtFetch(target.url.href, { useProxy: true });

      imageResponse.body.pipe(reply.raw);
    } catch (error) {
      this.failUpstream(reply, 'image', target.url.hostname, error);
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
      return;
    }

    const target = parseProxyTarget(request.query['url'] as string, streamHostSuffixes());

    if (target.error) {
      this.rejectTarget(reply, 'stream', target.error);
      return;
    }

    const streamProxyUrl = `${originUrl}/api/proxy/stream?originUrl=${encodeURIComponent(originUrl)}`;

    try {
      const rawHeaders = request.raw.headers;
      const headers = {
        range: rawHeaders.range,
        'user-agent': rawHeaders['user-agent'],
        origin: 'https://www.youtube.com'
      };

      const urlToFetch = target.url;

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
      this.failUpstream(reply, 'stream', target.url.hostname, error);
    }
  }
}
