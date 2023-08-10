/* Copyright (c) 2020, FreeTubeApp

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies. */

import { YoutubeGrabberHelper } from '../YoutubeGrabberHelper';

export class YoutubeChannelFetcher {
  static async getChannelVideosNewest(channelId, channelIdType, httpAgent = null) {
    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent);
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(
      channelId,
      'videos?flow=grid&view=0&pbj=1',
      channelIdType
    );
    return await ytGrabHelp.parseChannelVideoResponse(
      channelPageResponse.response,
      channelId,
      channelPageResponse.channelIdType
    );
  }

  static async getChannelVideosOldest(channelId, channelIdType, httpAgent = null) {
    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent);
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(
      channelId,
      'videos?view=0&sort=da&flow=grid&pbj=1',
      channelIdType
    );
    return await ytGrabHelp.parseChannelVideoResponse(
      channelPageResponse.response,
      channelId,
      channelPageResponse.channelIdType
    );
  }

  static async getChannelVideosPopular(channelId, channelIdType, httpAgent = null) {
    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent);
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(
      channelId,
      'videos?view=0&sort=p&flow=grid&pbj=1',
      channelIdType
    );
    return await ytGrabHelp.parseChannelVideoResponse(
      channelPageResponse.response,
      channelId,
      channelPageResponse.channelIdType
    );
  }

  static async getChannelList(
    channelId,
    channelIdType,
    tab = 'videos',
    sortBy = 'newest',
    httpAgent = null
  ) {
    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent);
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(
      channelId,
      `${tab}?view=0&sort=p&flow=grid&pbj=1`,
      channelIdType
    );
    return await ytGrabHelp.parseChannelVideoResponse(
      channelPageResponse.response,
      channelId,
      channelPageResponse.channelIdType
    );
  }
}
