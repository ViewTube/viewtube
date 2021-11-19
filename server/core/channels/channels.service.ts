import path from 'path';
import fs from 'fs';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Consola from 'consola';
import { Model } from 'mongoose';
import fetch from 'node-fetch';
import { General } from 'server/common/general.schema';
import { FastifyReply } from 'fastify';
import { ChannelMapper } from './channel.mapper';
import { ChannelDto } from './dto/channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(General.name)
    private readonly GeneralModel: Model<General>
  ) {}

  private youtubeClientParams = {
    hl: 'en',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
    clientName: 'WEB',
    clientVersion: '2.20200922.02.00',
    osName: 'Windows',
    browserName: 'Chrome',
    browserVersion: '85.0.4183.102',
    screenHeightPoints: 767,
    screenPixelDensity: 1,
    screenWidthPoints: 1536
  };

  private featuredParam = 'EghmZWF0dXJlZA%3D%3D';
  private videosParam = 'EgZ2aWRlb3M%3D';
  private aboutParam = 'EgVhYm91dA%3D%3D';

  private channelApiUrl = 'https://www.youtube.com/youtubei/v1/browse';

  async getChannel(channelId: string): Promise<ChannelDto> {
    const generalRecord = await this.GeneralModel.findOne({ version: 1 }).exec();
    let apiKey: string | void;
    if (!(generalRecord && generalRecord.innertubeApiKey)) {
      apiKey = await this.refreshApiKey();
    } else if (generalRecord && generalRecord.innertubeApiKey) {
      apiKey = generalRecord.innertubeApiKey;
    }
    if (apiKey) {
      try {
        let rawChannelData = await this.fetchRawChannelData(channelId, apiKey);
        let aboutChannelId = channelId;

        if (!rawChannelData) {
          const trueChannelId = await this.getChannelIdFromUsername(channelId);
          if (trueChannelId) {
            rawChannelData = await this.fetchRawChannelData(trueChannelId, apiKey);
            aboutChannelId = trueChannelId;
          }
        }

        if (rawChannelData) {
          const rawAboutData = await fetch(`${this.channelApiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
              Accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
              'Content-Type': 'text/html; charset=UTF-8',
              'User-Agent': this.youtubeClientParams.userAgent
            },
            body: JSON.stringify({
              context: {
                client: this.youtubeClientParams
              },
              browseId: aboutChannelId,
              params: this.aboutParam
            })
          }).then(response => response.json());

          return ChannelMapper.mapChannel(rawChannelData, rawAboutData);
        }
      } catch (error) {
        throw new InternalServerErrorException(error);
      }
    }
    throw new InternalServerErrorException('Error fetching channel');
  }

  async fetchRawChannelData(channelId: string, apiKey: string): Promise<any> {
    let response = null;
    try {
      response = await fetch(`${this.channelApiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          Accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
          'Content-Type': 'text/html; charset=UTF-8',
          'User-Agent': this.youtubeClientParams.userAgent
        },
        body: JSON.stringify({
          context: {
            client: this.youtubeClientParams
          },
          browseId: channelId,
          params: this.featuredParam
        })
      });
    } catch {
      // Swallowing error
    }
    if (response && response.ok) {
      return response.json();
    }
    // channelId might be a username
    return null;
  }

  async getChannelIdFromUsername(username: string): Promise<string> {
    const url = `https://www.youtube.com/user/${username}`;
    const rawSite = await fetch(url, {
      headers: {
        Accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
        'Content-Type': 'text/html; charset=UTF-8',
        'User-Agent': this.youtubeClientParams.userAgent
      }
    })
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        return null;
      })
      .catch(_ => {
        throw new InternalServerErrorException('Error converting channel name to id');
      });

    if (rawSite) {
      const channelId = rawSite.match(
        /.*?og:url.*?content="https:\/\/www\.youtube\.com\/channel\/(.*)".*/im
      )[1];
      return channelId;
    }
    return null;
  }

  async refreshApiKey(): Promise<string | void> {
    const url = 'https://www.youtube.com/channel/UCGkmcEne_L9uynfi44aW4Fw';
    const rawSite = await fetch(url, {
      headers: {
        Accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
        'Content-Type': 'text/html; charset=UTF-8',
        'User-Agent': this.youtubeClientParams.userAgent
      }
    })
      .then(response => response.text())
      .catch(_ => {
        Consola.error('Error refreshing API key');
      });
    if (rawSite) {
      const apiKey = rawSite.match(/"INNERTUBE_API_KEY":"(.*?)",/im)[1];
      await this.GeneralModel.findOneAndUpdate(
        { version: 1 },
        { innertubeApiKey: apiKey },
        { upsert: true }
      ).exec();
      return apiKey;
    }
    return null;
  }

  getTinyThumbnail(reply: FastifyReply, id: string) {
    // eslint-disable-next-line dot-notation
    const imgPathWebp = path.join(global['__basedir'], `channels/${id}.webp`);
    // eslint-disable-next-line dot-notation
    const imgPathJpg = path.join(global['__basedir'], `channels/${id}.jpg`);

    try {
      const fileStream = fs.createReadStream(imgPathWebp);
      reply.type('image/webp').send(fileStream);
      return;
    } catch {
      // Error is thrown later
    }

    try {
      const fileStream = fs.createReadStream(imgPathJpg);
      reply.type('image/jpeg').send(fileStream);
      return;
    } catch {
      // Error is thrown later
    }

    throw new NotFoundException();
  }
}
