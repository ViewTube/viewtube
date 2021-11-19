import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import fetch from 'node-fetch';
import { FastifyReply, FastifyRequest } from 'fastify';
import undici, { Client } from 'undici';
import Consola from 'consola';
@Injectable()
export class ProxyService {
  constructor(private configService: ConfigService) {}

  async proxyText(url: string, local = true): Promise<string> {
    try {
      let proxyAgent = null;
      if (this.configService.get('VIEWTUBE_PROXY_URL') && !local) {
        const proxy = this.configService.get('VIEWTUBE_PROXY_URL');
        proxyAgent = new HttpsProxyAgent(proxy);
      }
      const fetchResponse = await fetch(url, { agent: proxyAgent });
      if (fetchResponse) {
        const result = await fetchResponse.text();
        return result;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    throw new InternalServerErrorException('Error fetching url');
  }

  async proxyImage(url: string, reply: FastifyReply, local = false): Promise<void> {
    try {
      let proxyUrl = null;
      if (this.configService.get('VIEWTUBE_PROXY_URL') && !local) {
        proxyUrl = this.configService.get('VIEWTUBE_PROXY_URL');
      }
      if (proxyUrl) {
        const client = new Client(proxyUrl);
        await client
          .stream(
            { method: 'GET', path: url, opaque: reply },
            ({ opaque }: { opaque: any }) => opaque.raw
          )
          .catch(error => {
            Consola.log(error);
          });
      } else {
        await undici
          .stream(
            url,
            { method: 'GET', opaque: reply },
            ({ opaque }: { opaque: any }) => opaque.raw
          )
          .catch(error => {
            Consola.log(error);
          });
      }
    } catch (error) {
      if (this.configService.get('NODE_ENV') !== 'production') {
        Consola.log(error);
      }
    }
  }

  async proxyStream(url: string, request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const stringUrl = Buffer.from(url, 'base64').toString('binary');
      const rawHeaders = request.raw.headers;
      const headers = {
        range: rawHeaders.range,
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        origin: 'https://www.youtube.com'
      };
      await undici
        .stream(
          stringUrl,
          { method: 'GET', opaque: reply, headers },
          ({ opaque }: { opaque: any }) => opaque.raw
        )
        .catch(error => {
          Consola.log(error);
        });
    } catch (error) {
      if (this.configService.get('NODE_ENV') !== 'production') {
        Consola.log(error);
      }
    }
  }
}
