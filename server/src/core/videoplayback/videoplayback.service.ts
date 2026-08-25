import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
      const headers = {
        range: rawHeaders.range,
        'accept-language': rawHeaders['accept-language'],
        'accept-encoding': rawHeaders['accept-encoding'],
        'user-agent': rawHeaders['user-agent'],
        origin: 'https://www.youtube.com',
        referer: 'https://www.youtube.com/'
      };

      const fetchResponse = await vtFetch(newUrl.toString(), {
        method: request.raw.method,
        headers,
        useProxy: true
      });

      reply.headers({
        'content-length': fetchResponse.headers['content-length'],
        'content-type': fetchResponse.headers['content-type'],
        'content-disposition': fetchResponse.headers['content-disposition'],
        'accept-ranges': fetchResponse.headers['accept-ranges'],
        'content-range': fetchResponse.headers['content-range']
      });

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
      // Stream failures are the most user-visible breakage in the app, so they are always logged
      // and always answered — swallowing them left the request hanging until socket timeout.
      this.logger.error(`Videoplayback proxy failed for ${urlHost}`, error);
      if (!reply.sent) {
        reply
          .code(502)
          .type('application/json')
          .send({
            statusCode: 502,
            message: `Failed to proxy videoplayback from ${urlHost}`,
            error: 'Bad Gateway'
          });
      }
    }
  }
}
