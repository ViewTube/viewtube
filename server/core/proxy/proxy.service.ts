import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import fetch from 'node-fetch';

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

  async proxyImage(url: string, reply: FastifyReply, local: boolean = false): Promise<void> {
    try {
      let proxyAgent = null;
      if (this.configService.get('VIEWTUBE_PROXY_URL') && !local) {
        const proxy = this.configService.get('VIEWTUBE_PROXY_URL');
        proxyAgent = new HttpsProxyAgent(proxy);
      }
      const fetchResponse = await fetch(url, { agent: proxyAgent, timeout: 5000 });

      if (fetchResponse.ok) {
        const image = await fetchResponse.buffer();
        reply.send(image);
      }
      throw new InternalServerErrorException();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async proxyStream(url: string): Promise<Buffer> {
    try {
      const fetchResponse = await fetch(Buffer.from(url, 'base64').toString('binary'), {
        timeout: 10000
      });

      if (fetchResponse.ok) {
        const streamBuffer = await fetchResponse.buffer();
        return streamBuffer;
      }
      throw new InternalServerErrorException();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
