import fs from 'fs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import HttpsProxyAgent from 'https-proxy-agent/dist/agent';
import FormData from 'form-data';
import fetch from 'node-fetch';

@Injectable()
export class CommentsService {
  constructor() {}

  private videoUrl = 'https://www.youtube.com/watch?v=';
  private commentsUrl = 'https://www.youtube.com/comment_service_ajax';

  private youtubeClientParams = {
    hl: 'en',
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
    clientName: 'WEB',
    clientVersion: '2.20210324.02.00',
    osName: 'Windows',
    browserName: 'Chrome',
    browserVersion: '89.0.4389.90',
    screenHeightPoints: 767,
    screenPixelDensity: 1,
    screenWidthPoints: 1536
  };

  async getComments(videoId: string) {
    const { sessionToken, cookie, continuation } = await this.getSessionToken(videoId);
    const parsedSessionToken = JSON.parse(`"${sessionToken}"`);
    console.log('xsrf: ' + parsedSessionToken);
    const formData = new FormData();
    formData.append('session_token', parsedSessionToken);
    const commentsResult = await fetch(
      `${this.commentsUrl}?action_get_comments=1&hl=en&gl=US&pbj=1&ctoken=${continuation}`,
      {
        method: 'POST',
        body: formData as any,
        headers: {
          cookie,
          'User-Agent': this.youtubeClientParams.userAgent,
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-youtube-client-name': 1,
          'x-youtube-client-version': this.youtubeClientParams.clientVersion
        } as any
      }
    ).then(result => {
      if (result.ok) {
        return result.text();
      }
    });
    return commentsResult;
  }

  async getSessionToken(
    videoId: string
  ): Promise<{ sessionToken: string; cookie: string; continuation: string }> {
    const rawSiteUrl = this.videoUrl + videoId;
    let cookie = null;
    const rawSite = await fetch(rawSiteUrl, {
      headers: {
        Accept: 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
        'Content-Type': 'text/html; charset=UTF-8',
        'User-Agent': this.youtubeClientParams.userAgent,
        'x-youtube-client-name': 1,
        'x-youtube-client-version': this.youtubeClientParams.clientVersion
      } as any
    })
      .then(response => {
        if (response.headers.get('set-cookie')) {
          cookie = response.headers.get('set-cookie');
        }
        return response.text();
      })
      .catch(e => {
        console.error(e);
      });

      console.log(rawSite);

    if (rawSite) {
      const sessionTokenMatch = rawSite.match(/"XSRF_TOKEN":"(.*?)",/im);
      let continuation = '';
      const initialDataMatch = rawSite.match(/var\sytInitialData = (.*});<\/script>/im);
      if (initialDataMatch && initialDataMatch[1]) {
        try {
          const ytInitialData = JSON.parse(initialDataMatch[1]);
          const continuationString = ytInitialData.contents.twoColumnWatchNextResults.results.results.contents.find(
            (e: { itemSectionRenderer: any }) => e.itemSectionRenderer
          ).itemSectionRenderer.continuations[0].nextContinuationData.continuation;
          continuation = continuationString;
        } catch (e) {
          console.log(e);
        }
      }
      if (sessionTokenMatch && sessionTokenMatch[1]) {
        return { sessionToken: sessionTokenMatch[1], cookie, continuation };
      }
    }
    return null;
  }
}
