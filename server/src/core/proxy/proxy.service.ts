import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { FastifyReply, FastifyRequest } from 'fastify';
import undici, { Client } from 'undici';
import { ofetch } from 'ofetch';
import { getProxyAgent, getProxyUrl, proxyEnabled } from 'server/common/proxyAgent';

@Injectable()
export class ProxyService {
  constructor(
    private configService: ConfigService,
    private readonly logger: Logger
  ) {}

  async proxyText(url: string, local = true): Promise<string> {
    try {
      const requestOptions: Record<string, unknown> = {};
      if (proxyEnabled() && !local) {
        requestOptions.headers = {
          agent: getProxyAgent()
        };
      }
      const fetchResponse = await ofetch<string>(url, requestOptions);
      if (fetchResponse) {
        return fetchResponse;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    throw new InternalServerErrorException('Error fetching url');
  }

  async proxyImage(url: string, reply: FastifyReply, local = false): Promise<void> {
    try {
      let proxyUrl = null;
      if (proxyEnabled() && !local) {
        proxyUrl = getProxyUrl();
      }
      if (proxyUrl) {
        const client = new Client(proxyUrl);
        await client
          .stream(
            { method: 'GET', path: url, opaque: reply },
            ({ opaque }: { opaque: any }) => opaque.raw
          )
          .catch(error => {
            this.logger.log(error);
          });
      } else {
        await undici
          .stream(
            url,
            { method: 'GET', opaque: reply },
            ({ opaque }: { opaque: any }) => opaque.raw
          )
          .catch(error => {
            this.logger.log(error);
          });
      }
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
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        origin: 'https://www.youtube.com'
      };
      await undici
        .stream(
          url,
          { method: 'GET', opaque: reply, headers },
          ({ opaque }: { opaque: any }) => opaque.raw
        )
        .catch(error => {
          this.logger.log(error);
        });
    } catch (error) {
      if (this.configService.get('NODE_ENV') !== 'production') {
        this.logger.log(error);
      }
    }
  }
}
