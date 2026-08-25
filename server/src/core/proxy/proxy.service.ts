import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  StreamableFile
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { IncomingHttpHeaders } from 'node:http';
import {
  imageHostSuffixes,
  parseProxyTarget,
  streamHostSuffixes
} from 'server/common/proxy-allowlist';
import { vtFetch } from 'server/common/vtFetch';
import { ProxyStreamQueryDto } from './dto/proxy-stream-query.dto';

type UpstreamResponse = Awaited<ReturnType<typeof vtFetch>>;

const imageContentTypes = ['image/'];
const xmlContentTypes = ['text/xml', 'application/xml', 'application/ttml+xml'];

const identityEncoding = { 'accept-encoding': 'identity' };

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

  private toStreamableFile(
    response: UpstreamResponse,
    allowedTypes: Array<string>,
    fallbackType: string
  ): StreamableFile {
    const contentType = response.headers['content-type'];
    const type =
      typeof contentType === 'string' &&
      allowedTypes.some(allowed => contentType.startsWith(allowed))
        ? contentType
        : fallbackType;

    const contentLength = Number(response.headers['content-length']);
    const length = Number.isFinite(contentLength) ? contentLength : undefined;

    return new StreamableFile(response.body, { type, ...(length !== undefined ? { length } : {}) });
  }

  async proxyText(url: string): Promise<StreamableFile> {
    let urlToProxy: URL;

    try {
      urlToProxy = new URL(url);
    } catch {
      throw new BadRequestException('url parameter is not a valid URL');
    }

    if (!this.allowedTextUrls.some(allowedUrl => urlToProxy.href.startsWith(allowedUrl))) {
      this.rejectTarget('text', `Url ${url} is not allowed to be proxied.`);
    }

    const textResponse = await vtFetch(urlToProxy.href, {
      headers: identityEncoding,
      useProxy: true
    }).catch(error => {
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

    return this.toStreamableFile(textResponse, xmlContentTypes, 'text/xml');
  }

  async proxyImage(url: string): Promise<StreamableFile> {
    const target = parseProxyTarget(url, imageHostSuffixes());

    if (target.error) {
      this.rejectTarget('image', target.error);
    }

    const imageResponse = await vtFetch(target.url.href, {
      headers: identityEncoding,
      useProxy: true
    }).catch(error => {
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

    return this.toStreamableFile(imageResponse, imageContentTypes, 'image/jpeg');
  }

  async proxyStream(
    query: ProxyStreamQueryDto,
    requestHeaders: IncomingHttpHeaders,
    reply: FastifyReply
  ): Promise<StreamableFile | string> {
    const { originUrl } = query;

    if (!originUrl) {
      throw new BadRequestException('originUrl is required.');
    }

    const target = parseProxyTarget(query.url, streamHostSuffixes());

    if (target.error) {
      this.rejectTarget('stream', target.error);
    }

    const streamProxyUrl = `${originUrl}/api/proxy/stream?originUrl=${encodeURIComponent(originUrl)}`;

    try {
      const headers = {
        range: requestHeaders.range,
        'user-agent': requestHeaders['user-agent'],
        origin: 'https://www.youtube.com'
      };

      const urlToFetch = target.url;

      const streamResponse = await vtFetch(urlToFetch, { headers, useProxy: true });

      if (streamResponse.headers['location']) {
        reply.header('location', `${streamProxyUrl}&url=${streamResponse.headers['location']}`);
      }

      reply.status(streamResponse.statusCode);

      if (urlToFetch.href.endsWith('.m3u8')) {
        const responseText = await streamResponse.body.text();
        return responseText.replace(
          /https:\/\/.*?.googlevideo\.com\/.*?\.m3u8/gi,
          (match: string) => {
            return `${streamProxyUrl}&url=${encodeURIComponent(match)}`;
          }
        );
      }

      return new StreamableFile(streamResponse.body);
    } catch (error) {
      this.logger.error(`Stream proxy failed for ${target.url.hostname}`, error);
      this.failUpstream('stream', target.url.hostname, 'YouTube could not be reached');
    }
  }
}
