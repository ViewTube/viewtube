import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  imageHostSuffixes,
  parseProxyTarget,
  streamHostSuffixes
} from 'server/common/proxy-allowlist';
import { vtFetch } from 'server/common/vtFetch';
import type { Dispatcher } from 'undici';

const imageContentTypes = ['image/'];
const xmlContentTypes = ['text/xml', 'application/xml', 'application/ttml+xml'];

@Injectable()
export class ProxyService {
  constructor(private readonly logger: Logger) {}

  allowedTextUrls = ['https://www.youtube.com/api/timedtext'];

  private rejectTarget(endpoint: string, error: string): never {
    this.logger.warn(`Blocked ${endpoint} proxy request: ${error}`);
    throw new ForbiddenException(error);
  }

  private failUpstream(endpoint: string, host: string, description: string): never {
    throw new BadGatewayException({
      message: `Failed to proxy ${endpoint} from ${host}`,
      description
    });
  }

  private forwardResponseHeaders(
    reply: FastifyReply,
    headers: Dispatcher.ResponseData['headers'],
    allowedTypes: Array<string>
  ): void {
    const contentType = headers['content-type'];
    if (
      typeof contentType === 'string' &&
      allowedTypes.some(type => contentType.startsWith(type))
    ) {
      reply.header('content-type', contentType);
    }

    // The body is forwarded verbatim, so its length and encoding are still the upstream ones.
    const contentLength = headers['content-length'];
    if (typeof contentLength === 'string') {
      reply.header('content-length', contentLength);
    }

    const contentEncoding = headers['content-encoding'];
    if (typeof contentEncoding === 'string') {
      reply.header('content-encoding', contentEncoding);
    }
  }

  async proxyText(url: string, reply: FastifyReply): Promise<void> {
    let urlToProxy: URL;

    try {
      urlToProxy = new URL(url);
    } catch {
      throw new BadRequestException('url parameter is not a valid URL');
    }

    if (this.allowedTextUrls.some(allowedUrl => urlToProxy.href.startsWith(allowedUrl))) {
      const textResponse = await vtFetch(urlToProxy.href, { useProxy: true }).catch(error => {
        this.logger.error(`Text proxy could not reach ${urlToProxy.hostname}`, error);
        return this.failUpstream('text', urlToProxy.hostname, 'YouTube could not be reached');
      });

      if (textResponse.statusCode >= 400) {
        await textResponse.body.dump();
        this.failUpstream(
          'text',
          urlToProxy.hostname,
          `YouTube answered with ${textResponse.statusCode}`
        );
      }

      this.forwardResponseHeaders(reply, textResponse.headers, xmlContentTypes);
      reply.send(textResponse.body);
    } else {
      this.rejectTarget('text', `Url ${url} is not allowed to be proxied.`);
    }
  }

  async proxyImage(url: string, reply: FastifyReply): Promise<void> {
    const target = parseProxyTarget(url, imageHostSuffixes());

    if (target.error) {
      this.rejectTarget('image', target.error);
    }

    const imageResponse = await vtFetch(target.url.href, { useProxy: true }).catch(error => {
      this.logger.error(`Image proxy could not reach ${target.url.hostname}`, error);
      return this.failUpstream('image', target.url.hostname, 'YouTube could not be reached');
    });

    if (imageResponse.statusCode >= 400) {
      await imageResponse.body.dump();
      this.failUpstream(
        'image',
        target.url.hostname,
        `YouTube answered with ${imageResponse.statusCode}`
      );
    }

    this.forwardResponseHeaders(reply, imageResponse.headers, imageContentTypes);
    reply.send(imageResponse.body);
  }

  async proxyStream(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const originUrl = request.query['originUrl'];

    if (!originUrl) {
      throw new BadRequestException('originUrl is required.');
    }

    const target = parseProxyTarget(request.query['url'] as string, streamHostSuffixes());

    if (target.error) {
      this.rejectTarget('stream', target.error);
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
      this.logger.error(`Stream proxy failed for ${target.url.hostname}`, error);
      this.failUpstream('stream', target.url.hostname, 'YouTube could not be reached');
    }
  }
}
