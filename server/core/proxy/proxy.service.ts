import { Readable } from 'stream';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import fetch from 'node-fetch';
import { FastifyReply, FastifyRequest } from '@nestjs/platform-fastify/node_modules/fastify';
import undici from 'undici';
@Injectable()
export class ProxyService {
  constructor(private configService: ConfigService) {}

  async proxyText(url: string, local: boolean = true): Promise<string> {
    try {
      let proxyAgent = null;
      if (this.configService.get('VIEWTUBE_PROXY_URL') && !local) {
        const proxy = this.configService.get('VIEWTUBE_PROXY_URL');
        proxyAgent = new HttpsProxyAgent(proxy);
      }
      const fetchResponse = await fetch(url, { agent: proxyAgent, timeout: 5000 });
      if (fetchResponse) {
        const result = await fetchResponse.text();
        return result;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    throw new InternalServerErrorException('Error fetching url');
  }

  async proxyImage(url: string, local: boolean = false): Promise<Readable> {
    try {
      let proxyAgent = null;
      if (this.configService.get('VIEWTUBE_PROXY_URL') && !local) {
        const proxy = this.configService.get('VIEWTUBE_PROXY_URL');
        proxyAgent = new HttpsProxyAgent(proxy);
      }
      const response = await fetch(url, { agent: proxyAgent, timeout: 5000 });

      if (response.ok) {
        const readable = new Readable();
        readable.wrap(response.body);
        return readable;
      }
      throw new InternalServerErrorException();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async proxyStream(url: string, request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const stringUrl = Buffer.from(url, 'base64').toString('binary');
      const rawHeaders = request.raw.headers;
      const headers = {
        range: rawHeaders.range,
        'accept-language': rawHeaders['accept-language'],
        'accept-encoding': rawHeaders['accept-encoding'],
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        origin: 'https://www.youtube.com'
      };
      await undici.stream(
        stringUrl,
        { method: 'GET', opaque: reply, headers },
        ({ opaque }: { opaque: any }) => opaque.raw
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
