/* Copyright (c) 2020, FreeTubeApp

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies. */

import { YoutubeGrabberHelper } from './YoutubeGrabberHelper';
import { YoutubeChannelFetcher } from './fetchers/YoutubeChannelFetcher';
import { YoutubePlaylistFetcher } from './fetchers/YoutubePlaylistFetcher';
import {
  ChannelCommunityPostsContinuationResponse,
  ChannelCommunityPostsResponse,
  ChannelHomeResponse,
  ChannelInfo,
  ChannelInfoError,
  ChannelInfoPayload,
  ChannelInfoResponse,
  ChannelInfoResponseContinuation,
  ChannelLivestreamsPayload,
  ChannelPlaylistPayload,
  ChannelSearchPayload,
  ChannelShortsPayload,
  ChannelStatsResponse,
  ChannelVideosPayload,
  CommunityPostContinuationPayload,
  ContinuationPayload,
  Playlist,
  RelatedChannel,
  Video
} from './types';

export class YoutubeGrabber {
  /**
   * Get channel information. Full list of channel information you can find in README.md file
   * @param { string } channelId The channel id to grab data from.
   * @param { string } channelIdType (optional) The type of id a channel id can be 1 = /channel/, 2= /user/, 3=/c/.
   * @param httpsAgent
   * @return { Promise<Object> } Return channel information
   * */
  static async getChannelInfo({
    channelId,
    channelIdType = 0,
    httpsAgent = null
  }: ChannelInfoPayload): Promise<ChannelInfo | ChannelInfoError> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const decideResponse = await ytGrabHelp?.decideUrlRequestType(
      channelId,
      'channels?flow=grid&view=0&pbj=1',
      channelIdType
    );
    const channelPageResponse = decideResponse?.response;
    let channelPageDataResponse = channelPageResponse?.data?.response;
    if (channelPageResponse?.data?.response === undefined) {
      channelPageDataResponse = channelPageResponse?.data?.[1]?.response;
    }
    let headerLinks;
    if ('c4TabbedHeaderRenderer' in (channelPageDataResponse?.header ?? {})) {
      headerLinks = channelPageDataResponse?.header?.c4TabbedHeaderRenderer?.headerLinks;
    }
    const links = {
      primaryLinks: [],
      secondaryLinks: []
    };
    if (typeof headerLinks !== 'undefined') {
      const channelHeaderLinksData = headerLinks?.channelHeaderLinksRenderer;
      links.primaryLinks = channelHeaderLinksData?.primaryLinks?.map(x => {
        const url = x.navigationEndpoint?.urlEndpoint?.url;
        const match = url?.match('&q=(.*)');
        return {
          url: match === null ? url : decodeURIComponent(match?.[1]),
          icon: x.icon?.thumbnails?.[0]?.url,
          title: x.title?.simpleText
        };
      });
      if (typeof channelHeaderLinksData?.secondaryLinks !== 'undefined') {
        links.secondaryLinks = channelHeaderLinksData?.secondaryLinks?.map(x => {
          const url = x.navigationEndpoint?.urlEndpoint?.url;
          const match = url?.match('&q=(.*)');
          return {
            url: match === null ? url : decodeURIComponent(match?.[1]),
            icon: x.icon?.thumbnails?.[0]?.url,
            title: x.title?.simpleText
          };
        });
      }
    }

    if (typeof channelPageDataResponse?.alerts !== 'undefined') {
      return {
        alertMessage: channelPageDataResponse?.alerts?.[0]?.alertRenderer?.text?.simpleText
      };
    }

    const channelMetaData = channelPageDataResponse?.metadata?.channelMetadataRenderer;
    let channelHeaderData = channelPageDataResponse?.header?.c4TabbedHeaderRenderer;
    if (!channelHeaderData) {
      channelHeaderData =
        channelPageDataResponse?.header?.carouselHeaderRenderer?.contents?.[1]
          .topicChannelDetailsRenderer;
      //  = topicChannelDetailsRenderer
    }
    const headerTabs = channelPageDataResponse?.contents?.twoColumnBrowseResultsRenderer?.tabs;
    const channelTabs = headerTabs
      .filter(tab => tab?.tabRenderer !== undefined && tab?.tabRenderer !== null)
      .map(tab => tab?.tabRenderer?.title);

    const channelsTab = YoutubeGrabberHelper?.findTab(headerTabs);
    let featuredChannels: any = {};
    if (channelsTab && 'sectionListRenderer' in (channelsTab?.tabRenderer?.content ?? {})) {
      featuredChannels =
        channelsTab?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer
          ?.contents?.[0];
    }
    let relatedChannels = [];
    let relatedChannelsContinuation = null;

    if (typeof featuredChannels?.gridRenderer !== 'undefined') {
      relatedChannels = featuredChannels?.gridRenderer?.items
        .filter(channel => {
          return typeof channel?.gridChannelRenderer !== 'undefined';
        })
        .map(channel => {
          return ytGrabHelp?.parseFeaturedChannel(channel?.gridChannelRenderer);
        });

      const continuationData = featuredChannels?.gridRenderer?.items;

      const continuationItem = continuationData?.filter(item => {
        return typeof item?.continuationItemRenderer !== 'undefined';
      });

      if (typeof continuationItem !== 'undefined' && typeof continuationItem?.[0] !== 'undefined') {
        relatedChannelsContinuation =
          continuationItem?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
            .token;
      }
    }

    let subscriberText;
    if (channelHeaderData?.subscriberCountText) {
      if (typeof channelHeaderData?.subscriberCountText?.runs !== 'undefined') {
        subscriberText = channelHeaderData?.subscriberCountText?.runs?.[0]?.text;
      } else {
        subscriberText = channelHeaderData?.subscriberCountText?.simpleText;
      }
    } else {
      subscriberText = '0 subscribers';
    }

    let bannerThumbnails = null;

    if (typeof channelHeaderData?.banner !== 'undefined') {
      bannerThumbnails = channelHeaderData?.banner?.thumbnails;
    }

    const subscriberSplit = subscriberText?.split(' ');
    const subscriberMultiplier = subscriberSplit?.[0]
      .substring(subscriberSplit?.[0]?.length - 1)
      .toLowerCase();

    let subscriberNumber;
    if (typeof parseFloat(subscriberMultiplier) === 'undefined') {
      subscriberNumber = parseFloat(subscriberText?.substring(0, subscriberSplit?.[0]?.length - 1));
    } else {
      subscriberNumber = parseFloat(subscriberSplit?.[0]);
    }

    let subscriberCount = subscriberNumber;
    if (subscriberMultiplier === 'k') {
      subscriberCount *= 1000;
    } else if (subscriberMultiplier === 'm') {
      subscriberCount *= 1000000;
    }

    let isVerified = false;
    let isOfficialArtist = false;
    if (channelHeaderData?.badges) {
      isVerified = channelHeaderData?.badges?.some(
        badge => badge?.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_VERIFIED'
      );
      isOfficialArtist = channelHeaderData?.badges?.some(
        badge => badge?.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_VERIFIED_ARTIST'
      );
    }

    const tags = channelPageDataResponse?.microformat?.microformatDataRenderer?.tags || null;
    const channelInfo = {
      author: channelMetaData?.title ?? channelHeaderData?.title?.simpleText,
      authorId:
        channelMetaData?.externalId ??
        channelHeaderData?.navigationEndpoint?.browseEndpoint?.browseId,
      authorUrl:
        channelMetaData?.vanityChannelUrl ??
        channelHeaderData?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url,
      authorBanners: bannerThumbnails,
      authorThumbnails: channelHeaderData?.avatar?.thumbnails,
      subscriberText: subscriberText,
      subscriberCount: subscriberCount,
      description: channelMetaData?.description ?? '',
      isFamilyFriendly: channelMetaData?.isFamilySafe ?? false,
      relatedChannels: {
        items: relatedChannels,
        continuation: relatedChannelsContinuation
      },
      allowedRegions: channelMetaData?.availableCountryCodes ?? [],
      isVerified: isVerified,
      isOfficialArtist: isOfficialArtist,
      tags: tags,
      channelLinks: links,
      channelTabs: channelTabs,
      channelIdType: decideResponse?.channelIdType
    };

    return channelInfo;
  }

  static async getRelatedChannelsMore({
    continuation,
    httpsAgent = null
  }: ContinuationPayload): Promise<ChannelInfoResponseContinuation<RelatedChannel>> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const urlParams = this?.GetContinuationUrlParams(continuation);
    const ajaxUrl =
      'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

    const channelPageResponse = await ytGrabHelp?.makeChannelPost(ajaxUrl, urlParams);

    if (channelPageResponse?.error) {
      return Promise?.reject(channelPageResponse?.message);
    }

    let nextContinuation = null;

    const continuationData =
      channelPageResponse?.data?.onResponseReceivedActions?.[0]?.appendContinuationItemsAction
        .continuationItems;

    const continuationItem = continuationData?.filter(item => {
      return typeof item?.continuationItemRenderer !== 'undefined';
    });

    if (typeof continuationItem !== 'undefined' && typeof continuationItem?.[0] !== 'undefined') {
      nextContinuation =
        continuationItem?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
          ?.token;
    }

    let relatedChannels = [];

    relatedChannels = continuationData
      .filter(channel => {
        return typeof channel?.gridChannelRenderer !== 'undefined';
      })
      .map(channel => {
        const author = channel?.gridChannelRenderer;
        let channelName;

        if (typeof author?.title?.runs !== 'undefined') {
          channelName = author?.title?.runs?.[0]?.text;
        } else {
          channelName = author?.title?.simpleText;
        }

        return {
          author: channelName,
          authorId: author?.channelId,
          authorUrl: author?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl,
          authorThumbnails: author?.thumbnail?.thumbnails
        };
      });

    return {
      items: relatedChannels,
      continuation: nextContinuation
    };
  }

  static async getChannelVideos({
    channelId,
    sortBy = 'newest',
    channelIdType = 0,
    httpsAgent = null
  }: ChannelVideosPayload): Promise<ChannelInfoResponse<Video> | ChannelInfoError> {
    if (sortBy === 'popular') {
      return await YoutubeChannelFetcher.getChannelVideosPopular(
        channelId,
        channelIdType,
        httpsAgent
      );
    } else if (sortBy === 'oldest') {
      return await YoutubeChannelFetcher.getChannelVideosOldest(
        channelId,
        channelIdType,
        httpsAgent
      );
    } else {
      // newest
      return await YoutubeChannelFetcher.getChannelVideosNewest(
        channelId,
        channelIdType,
        httpsAgent
      );
    }
  }

  static async getChannelLivestreams({
    channelId,
    sortBy = 'newest',
    channelIdType = 0,
    httpsAgent = null
  }: ChannelLivestreamsPayload): Promise<ChannelInfoResponse<Video>> {
    return await YoutubeChannelFetcher.getChannelList(
      channelId,
      channelIdType,
      'streams',
      sortBy,
      httpsAgent
    );
  }

  static async getChannelShorts({
    channelId,
    sortBy = 'newest',
    channelIdType = 0,
    httpsAgent = null
  }: ChannelShortsPayload): Promise<ChannelInfoResponse<Video>> {
    return await YoutubeChannelFetcher.getChannelList(
      channelId,
      channelIdType,
      'shorts',
      sortBy,
      httpsAgent
    );
  }

  static async getChannelVideosMore({
    continuation,
    httpsAgent = null
  }: ContinuationPayload): Promise<ChannelInfoResponseContinuation<Video>> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const urlParams = this?.GetContinuationUrlParams(continuation);
    const ajaxUrl =
      'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

    const channelPageResponse = await ytGrabHelp?.makeChannelPost(ajaxUrl, urlParams);

    if (channelPageResponse?.error) {
      return Promise?.reject(channelPageResponse?.message);
    }

    let nextContinuation = null;

    const continuationData =
      channelPageResponse?.data?.onResponseReceivedActions?.[0]?.appendContinuationItemsAction
        .continuationItems;

    const continuationItem = continuationData?.filter(item => {
      return typeof item?.continuationItemRenderer !== 'undefined';
    });

    if (typeof continuationItem !== 'undefined' && typeof continuationItem?.[0] !== 'undefined') {
      nextContinuation =
        continuationItem?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
          ?.token;
    }

    const channelMetaData = channelPageResponse?.data?.metadata?.channelMetadataRenderer;
    let channelInfo: any = {};
    if (channelMetaData) {
      const channelName = channelMetaData?.title;
      const channelId = channelMetaData?.externalId;

      channelInfo = {
        channelId,
        channelName
      };
    } else {
      let i = 0;
      // Look through every video until you can successfully find the channel metadata
      while (channelInfo?.channelName === undefined && i < continuationData?.length - 1) {
        const videoTitle = continuationData?.[i]?.richItemRenderer?.content?.videoRenderer?.title;
        const publishTimeText =
          continuationData?.[i]?.richItemRenderer?.content?.videoRenderer?.publishedTimeText;
        channelInfo = {
          channelId: channelPageResponse?.data?.responseContext?.serviceTrackingParams?.find(
            service => service?.service === 'GOOGLE_HELP'
          ).params?.[0]?.value
        };
        const channelNameRegex = new RegExp(
          `${videoTitle?.runs?.[0]?.text?.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          )} by (.*?) ${publishTimeText?.simpleText?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
          'g'
        ).exec(videoTitle?.accessibility?.accessibilityData?.label);
        if (channelNameRegex !== null && channelNameRegex?.length > 1) {
          channelInfo.channelName = channelNameRegex?.[1];
        }
        i++;
      }
    }

    const nextVideos = continuationData
      .filter(item => {
        return typeof item?.continuationItemRenderer === 'undefined';
      })
      .map(item => {
        return ytGrabHelp?.parseVideo(item, channelInfo);
      });

    return {
      items: nextVideos,
      continuation: nextContinuation
    };
  }

  static async getChannelPlaylistInfo({
    channelId,
    sortBy = 'last',
    channelIdType = 0,
    httpsAgent = null
  }: ChannelPlaylistPayload): Promise<ChannelInfoResponse<Playlist>> {
    if (sortBy === 'newest') {
      return await YoutubePlaylistFetcher.getChannelPlaylistNewest(
        channelId,
        channelIdType,
        httpsAgent
      );
    } else {
      // last
      return await YoutubePlaylistFetcher.getChannelPlaylistLast(
        channelId,
        channelIdType,
        httpsAgent
      );
    }
  }

  static async getChannelPlaylistsMore({
    continuation,
    httpsAgent = null
  }: ContinuationPayload): Promise<ChannelInfoResponseContinuation<Playlist>> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const urlParams = this?.GetContinuationUrlParams(continuation);
    const ajaxUrl =
      'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

    const channelPageResponse = await ytGrabHelp?.makeChannelPost(ajaxUrl, urlParams);

    if (channelPageResponse?.error) {
      return Promise?.reject(channelPageResponse?.message);
    }

    let nextContinuation = null;

    const continuationData =
      channelPageResponse?.data?.onResponseReceivedActions?.[0]?.appendContinuationItemsAction
        .continuationItems;

    const continuationItem = continuationData?.filter(item => {
      return typeof item?.continuationItemRenderer !== 'undefined';
    });

    if (typeof continuationItem !== 'undefined' && typeof continuationItem?.[0] !== 'undefined') {
      nextContinuation =
        continuationItem?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
          ?.token;
    }

    const channelMetaData = channelPageResponse?.data?.metadata?.channelMetadataRenderer;
    const channelName = channelMetaData?.title;
    const channelId = channelMetaData?.externalId;

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://www.youtube.com/channel/${channelId}`
    };

    const nextPlaylists = continuationData
      .filter(item => {
        return (
          typeof item?.gridShowRenderer === 'undefined' &&
          typeof item?.continuationItemRenderer === 'undefined'
        );
      })
      .map(item => {
        return ytGrabHelp?.parsePlaylist(item, channelInfo);
      });

    return {
      items: nextPlaylists,
      continuation: nextContinuation
    };
  }

  static async searchChannel({
    channelId,
    query = '',
    channelIdType = 0,
    httpsAgent = null
  }: ChannelSearchPayload): Promise<ChannelInfoResponseContinuation<Video> | ChannelInfoError> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const urlParams = new URLSearchParams({
      query: query,
      flow: 'grid',
      view: `${0}`,
      pbj: `${1}`
    });

    const decideResponse = await ytGrabHelp?.decideUrlRequestType(
      channelId,
      `search?${urlParams}`,
      channelIdType
    );
    const channelPageResponse = decideResponse?.response;
    let channelPageDataResponse = channelPageResponse?.data?.response;
    if (typeof channelPageDataResponse === 'undefined') {
      channelPageDataResponse = channelPageResponse?.data?.[1]?.response;
    }
    if (typeof channelPageDataResponse?.alerts !== 'undefined') {
      return {
        alertMessage: channelPageDataResponse?.alerts?.[0]?.alertRenderer?.text?.simpleText
      };
    }
    const channelMetaData = channelPageDataResponse?.metadata?.channelMetadataRenderer;
    const channelName = channelMetaData?.title;

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: `https://www.youtube.com/channel/${channelId}`
    };

    const searchTab =
      channelPageDataResponse?.contents?.twoColumnBrowseResultsRenderer?.tabs?.findIndex(tab => {
        return typeof tab?.expandableTabRenderer !== 'undefined';
      });

    const searchResults =
      channelPageDataResponse?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[searchTab]
        .expandableTabRenderer?.content?.sectionListRenderer;

    let continuation = null;

    const searchItems = searchResults?.contents;

    const continuationItem = searchItems?.filter(item => {
      return typeof item?.continuationItemRenderer !== 'undefined';
    });

    if (typeof continuationItem !== 'undefined' && typeof continuationItem?.[0] !== 'undefined') {
      continuation =
        continuationItem?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
          ?.token;
    }

    if (
      typeof searchItems?.[0]?.itemSectionRenderer?.contents?.[0]?.messageRenderer !== 'undefined'
    ) {
      return {
        continuation: null,
        items: []
      };
    }

    const parsedSearchItems = searchItems
      .filter(item => {
        return typeof item?.continuationItemRenderer === 'undefined';
      })
      .map(item => {
        const obj = item?.itemSectionRenderer?.contents?.[0];

        if (typeof obj?.playlistRenderer !== 'undefined') {
          return ytGrabHelp?.parsePlaylist(obj, channelInfo);
        } else {
          return ytGrabHelp?.parseVideo(obj, channelInfo);
        }
      });

    return {
      continuation: continuation,
      items: parsedSearchItems
    };
  }

  static async searchChannelMore({
    continuation,
    httpsAgent = null
  }: ContinuationPayload): Promise<ChannelInfoResponseContinuation<Video>> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const urlParams = this?.GetContinuationUrlParams(continuation);
    const ajaxUrl =
      'https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

    const channelPageResponse = await ytGrabHelp?.makeChannelPost(ajaxUrl, urlParams);

    if (channelPageResponse?.error) {
      return Promise?.reject(channelPageResponse?.message);
    }

    let nextContinuation = null;

    const continuationData =
      channelPageResponse?.data?.onResponseReceivedActions?.[0]?.appendContinuationItemsAction
        .continuationItems;
    const continuationItem = continuationData?.filter(item => {
      return typeof item?.continuationItemRenderer !== 'undefined';
    });

    if (typeof continuationItem !== 'undefined' && typeof continuationItem?.[0] !== 'undefined') {
      nextContinuation =
        continuationItem?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand
          ?.token;
    }

    const channelMetaData = channelPageResponse?.data?.metadata?.channelMetadataRenderer;
    const channelName = channelMetaData?.title;
    const channelId = channelMetaData?.externalId;

    const channelInfo = {
      channelId: channelId,
      channelName: channelName
    };

    const nextVideos = continuationData
      .filter(item => {
        return typeof item?.continuationItemRenderer === 'undefined';
      })
      .map(item => {
        const channel = item?.itemSectionRenderer?.contents?.[0];
        return ytGrabHelp?.parseVideo(channel, channelInfo);
      });

    return {
      items: nextVideos,
      continuation: nextContinuation
    };
  }

  static async getChannelCommunityPosts({
    channelId,
    channelIdType = 0,
    httpsAgent = null
  }: ChannelInfoPayload): Promise<ChannelCommunityPostsResponse> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const channelPageResponse = await ytGrabHelp?.decideUrlRequestType(
      channelId,
      'community',
      channelIdType
    );
    return ytGrabHelp?.parseCommunityPage(
      channelPageResponse?.response,
      channelPageResponse?.channelIdType
    );
  }

  static async getChannelCommunityPostsMore({
    continuation,
    innerTubeApi,
    httpsAgent = null
  }: CommunityPostContinuationPayload): Promise<ChannelCommunityPostsContinuationResponse> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const channelPageResponse = await ytGrabHelp?.makeChannelPost(
      `https://www.youtube.com/youtubei/v1/browse?key=${innerTubeApi}`,
      this.GetContinuationUrlParams(continuation)
    );
    if (channelPageResponse?.error) {
      return Promise?.reject(channelPageResponse?.message);
    }
    const postDataArray =
      channelPageResponse?.data?.onResponseReceivedEndpoints?.[0]?.appendContinuationItemsAction
        .continuationItems;
    const contValue =
      'continuationItemRenderer' in (postDataArray?.[postDataArray?.length - 1] ?? {})
        ? postDataArray?.[postDataArray?.length - 1]?.continuationItemRenderer?.continuationEndpoint
            .continuationCommand?.token
        : null;
    return {
      items: ytGrabHelp?.createCommunityPostArray(postDataArray),
      continuation: contValue,
      innerTubeApi: innerTubeApi
    };
  }

  static async getChannelStats({
    channelId,
    channelIdType = 0,
    httpsAgent = null
  }: ChannelInfoPayload): Promise<ChannelStatsResponse | ChannelInfoError> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const decideResponse = await ytGrabHelp?.decideUrlRequestType(
      channelId,
      'about?flow=grid&view=0&pbj=1',
      channelIdType
    );
    const channelPageResponse = decideResponse?.response;
    const channelPageDataResponse = channelPageResponse?.data?.[1]?.response;
    if (typeof channelPageDataResponse?.alerts !== 'undefined') {
      return {
        alertMessage: channelPageDataResponse?.alerts?.[0]?.alertRenderer?.text?.simpleText
      };
    }
    const headerTabs = channelPageDataResponse?.contents?.twoColumnBrowseResultsRenderer?.tabs;
    const aboutTab = YoutubeGrabberHelper?.findTab(headerTabs);

    let views = '0';
    let location = 'unknown';
    let joined = null;
    if (aboutTab !== undefined) {
      const contents =
        aboutTab?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer
          ?.contents?.[0];
      joined = Date?.parse(
        contents?.channelAboutFullMetadataRenderer?.joinedDateText?.runs?.[1]?.text
      );
      if ('viewCountText' in (contents?.channelAboutFullMetadataRenderer ?? {})) {
        views = contents?.channelAboutFullMetadataRenderer?.viewCountText?.simpleText?.replace(
          /\D/g,
          ''
        );
      }

      if ('country' in (contents?.channelAboutFullMetadataRenderer ?? {})) {
        location = contents?.channelAboutFullMetadataRenderer?.country?.simpleText;
      }
    }

    return {
      joinedDate: joined,
      viewCount: parseInt(views),
      location: location
    };
  }

  static async getChannelHome({
    channelId,
    channelIdType = 0,
    httpsAgent = null
  }: ChannelInfoPayload): Promise<ChannelHomeResponse | ChannelInfoError> {
    const ytGrabHelp = YoutubeGrabberHelper?.create(httpsAgent);
    const decideResponse = await ytGrabHelp?.decideUrlRequestType(
      channelId,
      'home?flow=grid&view=0&pbj=1',
      channelIdType
    );
    const channelPageResponse = decideResponse?.response;
    let channelPageDataResponse = channelPageResponse?.data?.response;
    if (typeof channelPageDataResponse === 'undefined') {
      channelPageDataResponse = channelPageResponse?.data?.[1]?.response;
    }
    if (typeof channelPageDataResponse?.alerts !== 'undefined') {
      return {
        alertMessage: channelPageDataResponse?.alerts?.[0]?.alertRenderer?.text?.simpleText
      };
    }
    const headerTabs = channelPageDataResponse?.contents?.twoColumnBrowseResultsRenderer?.tabs;
    let channelName;
    let channelUrl;
    if ('metadata' in channelPageDataResponse) {
      channelName = channelPageDataResponse?.metadata?.channelMetadataRenderer?.title;
      channelUrl = channelPageDataResponse?.metadata?.channelMetadataRenderer?.vanityChannelUrl;
    } else {
      const channelDetails =
        channelPageResponse?.data?.[1]?.response?.header?.carouselHeaderRenderer?.contents?.[1]
          .topicChannelDetailsRenderer;
      channelName = channelDetails?.title;
      channelUrl = channelDetails?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl;
    }

    const channelInfo = {
      channelId: channelId,
      channelName: channelName,
      channelUrl: channelUrl
    };

    const homeTab = YoutubeGrabberHelper?.findTab(headerTabs);
    let featuredVideo = null;
    let homeItems = [];
    if ('sectionListRenderer' in (homeTab?.tabRenderer?.content ?? {})) {
      homeItems = homeTab?.tabRenderer?.content?.sectionListRenderer?.contents?.filter(x => {
        if ('shelfRenderer' in (x.itemSectionRenderer?.contents?.[0] ?? {})) {
          return true;
        } else if ('channelVideoPlayerRenderer' in (x.itemSectionRenderer?.contents?.[0] ?? {})) {
          featuredVideo = ytGrabHelp?.parseVideo(x.itemSectionRenderer?.contents?.[0], channelInfo);
        } else if (
          'channelFeaturedContentRenderer' in (x.itemSectionRenderer?.contents?.[0] ?? {})
        ) {
          return true;
        }
        return false;
      });
    } else {
      if ('richGridRenderer' in (headerTabs?.[0]?.tabRenderer?.content ?? {})) {
        homeItems = headerTabs?.[0]?.tabRenderer?.content?.richGridRenderer?.contents;
      } else if ('sectionListRenderer' in (headerTabs?.[0]?.tabRenderer?.content ?? {})) {
        homeItems = headerTabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
      }
    }
    homeItems = homeItems?.map(item => {
      return ytGrabHelp?.parseHomeItem(item, channelInfo);
    });
    return {
      featuredVideo: featuredVideo,
      items: homeItems
    };
  }

  static GetContinuationUrlParams(continuation) {
    return {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20201021.03.00'
        }
      },
      continuation: continuation
    };
  }
}
