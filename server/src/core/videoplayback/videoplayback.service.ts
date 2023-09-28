import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { URL } from 'node:url';
import { vtFetch } from 'server/common/vtFetch';

@Injectable()
export class VideoplaybackService {
  constructor(
    private configService: ConfigService,
    private readonly logger: Logger
  ) {}
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
        origin: 'https://www.youtube.com'
      };

      const fetchResponse = await vtFetch(newUrl.toString(), {
        method: request.raw.method,
        headers
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

      reply.status(fetchResponse.statusCode);
      fetchResponse.body.pipe(reply.raw);
    } catch (error) {
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.logger.log(error);
      }
    }
  }
}
