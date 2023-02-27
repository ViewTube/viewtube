import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { URL } from 'node:url';
import undici from 'undici';
@Injectable()
export class VideoplaybackService {
  constructor(private configService: ConfigService, private readonly logger: Logger) {}
  async proxyStream(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      let url = request.url;

      // URL constructor expects valid url
      if (!url.startsWith('http')) {
        url = `https://example.com${url}`;
      }
      const oldUrl = new URL(url);
      const urlHost = oldUrl.searchParams.get('host');

      const newUrl = new URL(`https://${urlHost}/videoplayback`);
      for (const [key, value] of oldUrl.searchParams as any) {
        newUrl.searchParams.append(key, value);
      }

      const rawHeaders = request.raw.headers;
      const headers = {
        range: rawHeaders.range,
        'accept-language': rawHeaders['accept-language'],
        'accept-encoding': rawHeaders['accept-encoding'],
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        origin: 'https://www.youtube.com'
      };
      await undici
        .stream(
          newUrl.toString(),
          { method: 'GET', opaque: reply, headers },
          data => (data.opaque as any).raw
        )
        .catch(error => {
          if (this.configService.get('NODE_ENV') !== 'production') {
            this.logger.log(error);
          }
        });
    } catch (error) {
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.logger.log(error);
      }
    }
  }
}
