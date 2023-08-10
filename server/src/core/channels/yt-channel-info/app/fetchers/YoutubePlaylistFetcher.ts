/* Copyright (c) 2020, FreeTubeApp

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies. */

import { YoutubeGrabberHelper } from '../YoutubeGrabberHelper';

export class YoutubePlaylistFetcher {
  static async getChannelPlaylistLast(channelId, channelIdType, httpAgent = null) {
    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent);
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(
      channelId,
      'playlists?flow=grid&sort=lad&view=1&pbj=1',
      channelIdType
    );
    return await this.parseChannelPlaylistResponse(
      channelPageResponse.response,
      channelPageResponse.channelIdType
    );
  }

  static async getChannelPlaylistNewest(channelId, channelIdType, httpAgent = null) {
    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent);
    const channelPageResponse = await ytGrabHelp.decideUrlRequestType(
      channelId,
      'playlists?view=1&sort=dd&flow=grid&pbj=1',
      channelIdType
    );
    return await this.parseChannelPlaylistResponse(
      channelPageResponse.response,
      channelPageResponse.channelIdType
    );
  }

  static async parseChannelPlaylistResponse(response, channelIdType, httpAgent = null) {
    let channelPageDataResponse = response.data.response;
    if (typeof channelPageDataResponse === 'undefined') {
      channelPageDataResponse = response.data[1].response;
    }
    if (typeof channelPageDataResponse.alerts !== 'undefined') {
      return {
        alertMessage: channelPageDataResponse.alerts[0].alertRenderer.text.simpleText
      };
    }
    let channelName;
    let channelMetaData;
    let channelId;
    if ('metadata' in channelPageDataResponse) {
      channelMetaData = channelPageDataResponse.metadata.channelMetadataRenderer;
      channelName = channelMetaData.title;
      channelId = channelMetaData.externalId;
    }
    const ytGrabHelp = YoutubeGrabberHelper.create(httpAgent);

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://www.youtube.com/channel/${channelId}`
    };
    let playlistData;
    const playlistTab = YoutubeGrabberHelper.findTab(
      channelPageDataResponse.contents.twoColumnBrowseResultsRenderer.tabs
    );

    if (playlistTab && 'sectionListRenderer' in playlistTab.tabRenderer.content) {
      const tabRenderer = playlistTab.tabRenderer;
      playlistData =
        tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
          .gridRenderer;
    }
    if (typeof playlistData === 'undefined') {
      return {
        continuation: null,
        items: []
      };
    }

    const playlistItems = playlistData.items
      .filter(playlist => {
        return (
          typeof playlist.gridShowRenderer === 'undefined' &&
          typeof playlist.continuationItemRenderer === 'undefined'
        );
      })
      .map(playlist => {
        const item = ytGrabHelp.parsePlaylist(playlist, channelInfo);
        if (item !== null) {
          return item;
        }
        return undefined;
      });

    let continuation = null;

    const continuationItem = playlistData.items.filter(item => {
      return typeof item.continuationItemRenderer !== 'undefined';
    });

    if (typeof continuationItem !== 'undefined' && continuationItem.length > 0) {
      continuation =
        continuationItem[0].continuationItemRenderer.continuationEndpoint.continuationCommand.token;
    }

    return {
      continuation: continuation,
      items: playlistItems,
      channelIdType: channelIdType
    };
  }
}
