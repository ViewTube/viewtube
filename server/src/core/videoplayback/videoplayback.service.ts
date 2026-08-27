import { BadGatewayException, BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { URL } from 'node:url';
import { vtFetch } from 'server/common/vtFetch';

@Injectable()
export class VideoplaybackService {
  constructor(private readonly logger: Logger) {}
  async proxyStream(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    let requestUrl = request.url;

    // URL constructor expects valid url
    if (!requestUrl.startsWith('http')) {
      requestUrl = `https://example.com${requestUrl}`;
    }
    const oldUrl = new URL(requestUrl);
    const urlHost = oldUrl.searchParams.get('__host');

    if (!urlHost) {
      throw new BadRequestException('__host parameter is required');
    }

    if (!urlHost.endsWith('.googlevideo.com')) {
      throw new BadRequestException('Invalid __host parameter');
    }

    try {
      const newUrl = new URL(`https://${urlHost}/videoplayback`);
      for (const [key, value] of oldUrl.searchParams as any) {
        newUrl.searchParams.append(key, value);
      }

      const rawHeaders = request.raw.headers;
      const isSabrRequest = request.raw.method === 'POST';

      const headers: Record<string, string> = {
        'accept-language': rawHeaders['accept-language'],
        'accept-encoding': rawHeaders['accept-encoding'],
        'user-agent': rawHeaders['user-agent'],
        origin: 'https://www.youtube.com',
        referer: 'https://www.youtube.com/'
      };

      // A SABR request carries its byte range inside the protobuf body; forwarding a
      // Range header as well makes YouTube answer with a 206 that the UMP parser cannot
      // read.
      if (!isSabrRequest) {
        headers.range = rawHeaders.range;
      } else {
        headers['content-type'] = 'application/x-protobuf';
      }

      const fetchResponse = await vtFetch(newUrl.toString(), {
        method: request.raw.method,
        headers,
        body: isSabrRequest ? (request.body as Buffer) : undefined,
        useProxy: true
      });

      // A SABR response is chunked and carries no content-length. Passing the missing
      // header through anyway makes Fastify emit an empty `Content-Length`, which is not
      // valid HTTP — the browser drops the response as ERR_ABORTED before any handler
      // sees it. Only forward headers YouTube actually sent.
      const forwarded = [
        'content-length',
        'content-type',
        'content-disposition',
        'accept-ranges',
        'content-range'
      ];
      for (const header of forwarded) {
        const value = fetchResponse.headers[header];
        if (value !== undefined) reply.header(header, value);
      }

      if (fetchResponse.headers['location']) {
        const newLocation = new URL(fetchResponse.headers['location'].toString());

        newLocation.searchParams.delete('__host');

        const searchParams = new URLSearchParams();
        for (const [key, value] of newLocation.searchParams) {
          searchParams.append(key, value);
        }
        searchParams.append('__host', newLocation.host);
        reply.header('location', `/api/videoplayback?${searchParams.toString()}`);
      }

      reply.status(fetchResponse.statusCode).send(fetchResponse.body);
    } catch (error) {
      this.logger.error(`Videoplayback proxy failed for ${urlHost}`, error);
      throw new BadGatewayException({
        message: `Failed to proxy videoplayback from ${urlHost}`,
        description: 'YouTube could not be reached'
      });
    }
  }
}
