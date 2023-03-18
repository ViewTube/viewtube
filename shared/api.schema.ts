/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/api/videos/{id}": {
    get: operations["VideosController_getVideos"];
  };
  "/api/videos/manifest/dash/{id}": {
    get: operations["VideosController_getDashManifest"];
  };
  "/api/videos/dislikes/{id}": {
    get: operations["VideosController_getDislikes"];
  };
  "/api/videoplayback": {
    get: operations["VideoplaybackController_getVideoplayback"];
  };
  "/api/autocomplete": {
    get: operations["AutocompleteController_getQuery"];
  };
  "/api/search/filters": {
    get: operations["SearchController_getFilters"];
  };
  "/api/search/continuation": {
    post: operations["SearchController_searchContinuation"];
  };
  "/api/search": {
    get: operations["SearchController_search"];
  };
  "/api/channels/{id}/thumbnail/tiny.jpg": {
    get: operations["ChannelsController_getTinyThumbnailJpg"];
  };
  "/api/channels/{id}/thumbnail/tiny.webp": {
    get: operations["ChannelsController_getTinyThumbnailWebp"];
  };
  "/api/channels/{id}": {
    get: operations["ChannelsController_getChannelInfo"];
  };
  "/api/channels/{id}/home": {
    get: operations["ChannelsController_getChannelHome"];
  };
  "/api/channels/{id}/videos": {
    get: operations["ChannelsController_getChannelVideos"];
  };
  "/api/channels/videos/continuation": {
    get: operations["ChannelsController_getChannelVideosContinuation"];
  };
  "/api/channels/{id}/shorts": {
    get: operations["ChannelsController_getChannelShorts"];
  };
  "/api/channels/{id}/livestreams": {
    get: operations["ChannelsController_getChannelLivestreams"];
  };
  "/api/channels/{id}/playlists": {
    get: operations["ChannelsController_getChannelPlaylists"];
  };
  "/api/channels/playlists/continuation": {
    get: operations["ChannelsController_getChannelPlaylistsContinuation"];
  };
  "/api/channels/{id}/search": {
    get: operations["ChannelsController_searchChannel"];
  };
  "/api/channels/search/continuation": {
    get: operations["ChannelsController_searchChannelContinuation"];
  };
  "/api/channels/relatedchannels/continuation": {
    get: operations["ChannelsController_getRelatedChannelsContinuation"];
  };
  "/api/channels/{id}/communityposts": {
    get: operations["ChannelsController_getChannelCommunityPosts"];
  };
  "/api/channels/communityposts/continuation": {
    get: operations["ChannelsController_getChannelCommunityPostsContinuation"];
  };
  "/api/channels/{id}/stats": {
    get: operations["ChannelsController_getChannelStats"];
  };
  "/api/homepage/homefeed": {
    get: operations["HomepageController_getHomeFeed"];
  };
  "/api/proxy/text": {
    get: operations["ProxyController_getText"];
  };
  "/api/proxy/image": {
    get: operations["ProxyController_getQuery"];
  };
  "/api/proxy/stream": {
    get: operations["ProxyController_proxyStream"];
  };
  "/api/comments/{videoId}": {
    get: operations["CommentsController_getComments"];
  };
  "/api/comments/{videoId}/replies": {
    get: operations["CommentsController_getCommentReplies"];
  };
  "/api/playlists/{playlistId}": {
    get: operations["PlaylistsController_getPlaylist"];
  };
  "/api/playlists/continuation": {
    get: operations["PlaylistsController_getPlaylistContinuation"];
  };
  "/api/user/profile": {
    get: operations["UserController_getProfile"];
  };
  "/api/user/profile/details": {
    get: operations["UserController_getProfileDetails"];
  };
  "/api/user/export": {
    get: operations["UserController_getExport"];
  };
  "/api/user/profile/image/{username}": {
    get: operations["UserController_getProfileImage"];
  };
  "/api/user/profile/image": {
    post: operations["UserController_uploadProfileImage"];
    delete: operations["UserController_deleteProfileImage"];
  };
  "/api/user": {
    delete: operations["UserController_deleteUser"];
  };
  "/api/user/profile/password": {
    post: operations["UserController_changePassword"];
  };
  "/api/user/subscriptions/channels": {
    get: operations["SubscriptionsController_getSubscribedChannels"];
  };
  "/api/user/subscriptions/videos": {
    get: operations["SubscriptionsController_getSubscriptionVideos"];
  };
  "/api/user/subscriptions/{channelId}": {
    get: operations["SubscriptionsController_getSubscription"];
    put: operations["SubscriptionsController_createSubscription"];
    delete: operations["SubscriptionsController_deleteSubscription"];
  };
  "/api/user/subscriptions/multiple": {
    post: operations["SubscriptionsController_createMultipleSubscriptions"];
  };
  "/api/user/notifications/subscribe": {
    post: operations["NotificationsController_subscribeToNotifications"];
  };
  "/api/user/settings": {
    get: operations["SettingsController_getSettings"];
    put: operations["SettingsController_setSettings"];
  };
  "/api/user/history": {
    get: operations["HistoryController_getHistory"];
    delete: operations["HistoryController_deleteEntireHistory"];
  };
  "/api/user/history/{id}": {
    get: operations["HistoryController_getVideoVisit"];
    post: operations["HistoryController_setVideoVisit"];
  };
  "/api/user/history/{videoId}": {
    delete: operations["HistoryController_deleteHistoryEntry"];
  };
  "/api/user/history/from/{startDate}/to/{endDate}": {
    delete: operations["HistoryController_deleteHistoryRange"];
  };
  "/api/admin/logs": {
    get: operations["AdminController_getLogs"];
  };
  "/api/admin/logs/{logFile}": {
    get: operations["AdminController_downloadLogFile"];
  };
  "/api/admin/blocked-videos": {
    get: operations["AdminController_findAll"];
    post: operations["AdminController_create"];
  };
  "/api/admin/blocked-videos/{id}": {
    get: operations["AdminController_isVideoBlocked"];
    delete: operations["AdminController_delete"];
  };
  "/api/auth/login": {
    post: operations["AuthController_login"];
  };
  "/api/auth/logout": {
    post: operations["AuthController_logout"];
  };
  "/api/auth/register": {
    /**
     * Register a new user 
     * @description Request a captcha through the /auth/captcha endpoint,
     *     and pass its token and solution alongside the new user's credentials.
     */
    post: operations["RegisterController_registerUser"];
  };
  "/api/auth/captcha": {
    /** Get a captcha */
    get: operations["CaptchaController_getCaptcha"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    VTThumbnailDto: {
      quality?: string;
      url: string;
      width: number;
      height: number;
    };
    AuthorThumbnailDto: {
      url: string;
      width: number;
      height: number;
    };
    ChapterDto: {
      title: string;
      startTime: number;
    };
    RecommendedVideoDto: {
      videoId: string;
      title: string;
      videoThumbnails: (components["schemas"]["VTThumbnailDto"])[];
      author: string;
      authorUrl: string;
      authorId: string;
      authorThumbnails: (components["schemas"]["AuthorThumbnailDto"])[];
      lengthSeconds: number;
      viewCountText: string;
      viewCount: number;
    };
    VideoDto: {
      type: string;
      title: string;
      videoId: string;
      videoThumbnails: (components["schemas"]["VTThumbnailDto"])[];
      storyboards: Record<string, never>;
      description: string;
      descriptionHtml: string;
      published: number;
      publishedText: string;
      keywords: (string)[];
      viewCount: number;
      likeCount: number;
      paid: boolean;
      premium: boolean;
      isFamilyFriendly: boolean;
      allowedRegions: (string)[];
      genre: string;
      genreUrl: string;
      author: string;
      authorId: string;
      authorUrl: string;
      authorThumbnails: (components["schemas"]["AuthorThumbnailDto"])[];
      authorVerified: boolean;
      subCount: number;
      lengthSeconds: number;
      allowRatings: boolean;
      rating: number;
      isListed: boolean;
      liveNow: boolean;
      isUpcoming: boolean;
      adaptiveFormats: (Record<string, never>)[];
      legacyFormats: (Record<string, never>)[];
      chapters?: (components["schemas"]["ChapterDto"])[];
      captions: Record<string, never>;
      recommendedVideos: (components["schemas"]["RecommendedVideoDto"])[];
      dashManifest?: string;
    };
    DislikeDto: {
      id: string;
      dateCreated: string;
      likes: number;
      dislikes: number;
      rating: number;
      viewCount: number;
      deleted: boolean;
    };
    FilterValueDto: {
      active: boolean;
      description: string;
      name: string;
      url: string;
    };
    SearchFilterDto: {
      filterType: string;
      filterValues: (components["schemas"]["FilterValueDto"])[];
    };
    ChannelImageDto: {
      url: string;
      width: number;
      height: number;
    };
    RelatedChannelDto: {
      channelName: string;
      channelId: string;
      channelUrl: string;
      thumbnail: (components["schemas"]["ChannelImageDto"])[];
      videoCount: number;
      subscriberText: string;
      subscriberCount: number;
      verified: boolean;
      officialArtist?: boolean;
      officialArist: boolean;
    };
    ChannelLinkDto: {
      url: string;
      icon: string;
      title: string;
    };
    ChannelInfoDto: {
      author: string;
      authorId: string;
      authorUrl: string;
      authorBanners: (components["schemas"]["ChannelImageDto"])[];
      authorThumbnails: (components["schemas"]["ChannelImageDto"])[];
      subscriberText: string;
      subscriberCount: number;
      description: string;
      isFamilyFriendly: boolean;
      relatedChannels: {
        items?: (components["schemas"]["RelatedChannelDto"])[];
        continuation?: string | null;
      };
      allowedRegions: (string)[];
      isVerified: boolean;
      isOfficialArtist: boolean;
      tags: (string)[];
      channelIdType: number;
      channelTabs: (string)[];
      alertMessage: string;
      channelLinks: {
        primaryLinks?: (components["schemas"]["ChannelLinkDto"])[];
        secondaryLinks?: (components["schemas"]["ChannelLinkDto"])[];
      };
    };
    ChannelVideoDto: {
      author: string;
      authorId: string;
      durationText: string;
      lengthSeconds: number;
      liveNow: boolean;
      premiere: boolean;
      premium: boolean;
      publishedText: string;
      title: string;
      type: string;
      videoId: string;
      videoThumbnails: (components["schemas"]["ChannelImageDto"])[] | null;
      viewCount: number;
      viewCountText: string;
    };
    ChannelHomeDto: {
      featuredVideo: components["schemas"]["ChannelVideoDto"];
      items: {
        shelfName?: string;
        type?: Record<string, never>;
        items?: Record<string, never>;
      };
    };
    ChannelVideosDto: {
      channelIdType: number;
      alertMessage?: string;
      items: (components["schemas"]["ChannelVideoDto"])[];
      continuation: string;
    };
    ChannelVideosContinuationDto: {
      items: (components["schemas"]["ChannelVideoDto"])[];
      continuation: string;
    };
    ChannelPlaylistDto: {
      author: string;
      authorId: string;
      authorUrl: string;
      playlistId: string;
      playlistThumbnail: string;
      playlistUrl: string;
      title: string;
      type: string;
      videoCount: number;
    };
    ChannelPlaylistsDto: {
      channelIdType: number;
      alertMessage?: string;
      items: (components["schemas"]["ChannelPlaylistDto"])[];
      continuation: string;
    };
    ChannelPlaylistsContinuationDto: {
      items: (components["schemas"]["ChannelPlaylistDto"])[];
      continuation: string;
    };
    ChannelSearchDto: {
      items: (components["schemas"]["ChannelVideoDto"])[];
      continuation: string;
    };
    ChannelSearchContinuationDto: {
      items: (components["schemas"]["ChannelVideoDto"])[];
      continuation: string;
    };
    RelatedChannelsContinuationDto: {
      items: (Record<string, never>)[];
      continuation: string;
    };
    ChannelCommunityPostDto: {
      postText: string;
      postId: string;
      author: string;
      authorThumbnails: string;
      publishedText: string;
      voteCount: string;
      commentCount: string;
      postContent: Record<string, never>;
    };
    ChannelCommunityPostsDto: {
      channelIdType: number;
      innerTubeApi: string;
      items: (components["schemas"]["ChannelCommunityPostDto"])[];
      continuation: string;
    };
    ChannelCommunityPostsContinuationDto: {
      innerTubeApi: string;
      items: (components["schemas"]["ChannelCommunityPostDto"])[];
      continuation: string;
    };
    ChannelStatsDto: {
      joinedDate: number;
      viewCount: number;
      location: string;
    };
    VTVideoDto: {
      id: string;
      title: string;
      author: {
        id?: string;
        name?: string;
        thumbnails?: (components["schemas"]["VTThumbnailDto"])[];
        isVerified?: boolean;
        isArtist?: boolean;
        handle?: string;
      };
      description?: string;
      thumbnails?: (components["schemas"]["VTThumbnailDto"])[];
      richThumbnails?: (components["schemas"]["VTThumbnailDto"])[];
      duration: {
        text?: string;
        seconds?: number;
      };
      published: {
        /** Format: date-time */
        date?: string;
        text?: string;
      };
      viewCount?: number;
      /** Format: date-time */
      upcoming?: string;
      live?: boolean;
    };
    HomeFeedDto: {
      videos: (components["schemas"]["VTVideoDto"])[];
    };
    CommentDto: {
      authorThumbnails: (components["schemas"]["AuthorThumbnailDto"])[];
      author: string;
      authorId: string;
      publishedText: string;
      isEdited: boolean;
      likeCount: number;
      creatorHeart: boolean;
      replyToken: string;
      replyCount: number;
      content: string;
    };
    CommentsResponseDto: {
      comments: (components["schemas"]["CommentDto"])[];
      continuation: string;
    };
    PlaylistImageDto: {
      url: string | null;
      width: number;
      height: number;
    };
    PlaylistItemDto: {
      title: string;
      index: number;
      id: string;
      shortUrl: string;
      url: string;
      author: {
        name?: string;
        url?: string;
        channelID?: string;
      };
      thumbnails: (components["schemas"]["PlaylistImageDto"])[];
      bestThumbnail: components["schemas"]["PlaylistImageDto"];
      isLive: boolean;
      duration: string | null;
      durationSec: number | null;
    };
    PlaylistResultDto: {
      id: string;
      url: string;
      title: string;
      estimatedItemCount: number;
      views: number;
      thumbnails: (components["schemas"]["PlaylistImageDto"])[];
      bestThumbnail: components["schemas"]["PlaylistImageDto"];
      lastUpdated: string;
      description: string | null;
      visibility: Record<string, never>;
      author: {
        name?: string;
        url?: string;
        avatars?: (components["schemas"]["PlaylistImageDto"])[];
        bestAvatar?: components["schemas"]["PlaylistImageDto"];
        channelID?: string;
      };
      items: (components["schemas"]["PlaylistItemDto"])[];
      continuation: Record<string, unknown> | null;
    };
    SettingsDto: {
      miniplayer: boolean;
      chapters: boolean;
      theme: string;
      sponsorblockEnabled: boolean;
      sponsorblockSegmentSponsor: Record<string, never>;
      sponsorblockSegmentIntro: Record<string, never>;
      sponsorblockSegmentOutro: Record<string, never>;
      sponsorblockSegmentInteraction: Record<string, never>;
      sponsorblockSegmentSelfpromo: Record<string, never>;
      sponsorblockSegmentMusicOfftopic: Record<string, never>;
      sponsorblockSegmentPreview: Record<string, never>;
      autoplay: boolean;
      saveVideoHistory: boolean;
      showHomeSubscriptions: boolean;
      alwaysLoopVideo: boolean;
      autoplayNextVideo: boolean;
      audioModeDefault: boolean;
      defaultVideoSpeed: number;
      defaultVideoQuality: string;
      defaultAudioQuality: string;
      autoAdjustAudioQuality: boolean;
      autoAdjustVideoQuality: boolean;
      dashPlaybackEnabled: boolean;
    };
    UserprofileDto: {
      username: string;
      profileImage: string;
      settings: components["schemas"]["SettingsDto"];
      admin: boolean;
    };
    VideoBasicInfoDto: {
      videoId: string;
      title: string;
      published?: number;
      publishedText: string;
      author: string;
      authorId: string;
      authorVerified?: boolean;
      authorThumbnails?: (components["schemas"]["AuthorThumbnailDto"])[];
      authorThumbnailUrl?: string;
      videoThumbnails: (components["schemas"]["VTThumbnailDto"])[];
      description?: string;
      viewCount: number;
      likeCount?: number;
      dislikeCount?: number;
      lengthSeconds?: number;
      lengthString?: string;
      live?: boolean;
    };
    VideoVisitDetailsDto: {
      videoDetails: components["schemas"]["VideoBasicInfoDto"];
      videoId: string;
      progressSeconds: number;
      lengthSeconds: number;
      /** Format: date-time */
      lastVisit: string;
    };
    UserprofileDetailsDto: {
      username: string;
      profileImage: string;
      videoHistory: (components["schemas"]["VideoVisitDetailsDto"])[];
      /** Format: date-time */
      registeredAt: string;
      totalVideosCount: number;
      totalTimeString: string;
      subscribedChannelsCount: number;
      admin: boolean;
    };
    ChannelBasicInfoDto: {
      authorId: string;
      author: string;
      authorUrl?: string;
      authorThumbnails?: (components["schemas"]["AuthorThumbnailDto"])[];
      authorThumbnailUrl?: string;
      authorVerified?: boolean;
      subCount?: number;
      videoCount?: number;
      description?: string;
    };
    SubscribedChannelsResponseDto: {
      channels: (components["schemas"]["ChannelBasicInfoDto"])[];
      channelCount: number;
    };
    SubscriptionFeedResponseDto: {
      videoCount: number;
      videos: (components["schemas"]["VideoBasicInfoDto"])[];
      /** Format: date-time */
      lastRefresh: string;
    };
    SubscriptionStatusDto: {
      channelId: string;
      isSubscribed: boolean;
    };
    HistoryResponseDto: {
      videos: (components["schemas"]["VideoVisitDetailsDto"])[];
      videoCount: number;
    };
    VideoVisitDto: {
      videoId: string;
      progressSeconds: number;
      lengthSeconds: number;
      /** Format: date-time */
      lastVisit: string;
    };
    LogFileDto: {
      name: string;
      size: number;
      created: number;
      lastModified: number;
    };
    LogsDto: {
      logFiles: (components["schemas"]["LogFileDto"])[];
      location: string;
    };
    UserDto: {
      username: string;
      password: string;
    };
    RegistrationDto: {
      username: string;
      password: string;
      captchaToken: string;
      captchaSolution: string;
    };
    CaptchaDto: {
      token: string;
      captchaImage: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  VideosController_getVideos: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["VideoDto"];
        };
      };
    };
  };
  VideosController_getDashManifest: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": string;
        };
      };
    };
  };
  VideosController_getDislikes: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["DislikeDto"];
        };
      };
    };
  };
  VideoplaybackController_getVideoplayback: {
    responses: {
      200: never;
    };
  };
  AutocompleteController_getQuery: {
    parameters: {
      query: {
        q: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": (string)[];
        };
      };
    };
  };
  SearchController_getFilters: {
    parameters: {
      query: {
        q: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": (components["schemas"]["SearchFilterDto"])[];
        };
      };
    };
  };
  SearchController_searchContinuation: {
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SearchController_search: {
    parameters: {
      query: {
        q: string;
        pages?: number;
        limit?: number;
        safeSearch?: boolean;
        hl?: string;
        gl?: string;
        filterName?: string;
        filterValue?: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  ChannelsController_getTinyThumbnailJpg: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: never;
    };
  };
  ChannelsController_getTinyThumbnailWebp: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: never;
    };
  };
  ChannelsController_getChannelInfo: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelInfoDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelHome: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelHomeDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelVideos: {
    parameters: {
      query: {
        sort: string;
      };
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelVideosDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelVideosContinuation: {
    parameters: {
      query: {
        continuation: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelVideosContinuationDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelShorts: {
    parameters: {
      query: {
        sort: string;
      };
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelVideosDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelLivestreams: {
    parameters: {
      query: {
        sort: string;
      };
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelVideosDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelPlaylists: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelPlaylistsDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelPlaylistsContinuation: {
    parameters: {
      query: {
        continuation: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelPlaylistsContinuationDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_searchChannel: {
    parameters: {
      query: {
        query: string;
      };
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelSearchDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_searchChannelContinuation: {
    parameters: {
      query: {
        continuation: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelSearchContinuationDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getRelatedChannelsContinuation: {
    parameters: {
      query: {
        continuation: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["RelatedChannelsContinuationDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelCommunityPosts: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelCommunityPostsDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelCommunityPostsContinuation: {
    parameters: {
      query: {
        continuation: string;
        innertube: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelCommunityPostsContinuationDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  ChannelsController_getChannelStats: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelStatsDto"];
        };
      };
      404: never;
      500: never;
    };
  };
  HomepageController_getHomeFeed: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["HomeFeedDto"];
        };
      };
    };
  };
  ProxyController_getText: {
    parameters: {
      query: {
        url: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": string;
        };
      };
    };
  };
  ProxyController_getQuery: {
    parameters: {
      query: {
        url: string;
      };
    };
    responses: {
      200: never;
    };
  };
  ProxyController_proxyStream: {
    parameters: {
      query: {
        url: string;
      };
    };
    responses: {
      200: never;
    };
  };
  CommentsController_getComments: {
    parameters: {
      query: {
        continuation: string;
      };
      path: {
        videoId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["CommentsResponseDto"];
        };
      };
    };
  };
  CommentsController_getCommentReplies: {
    parameters: {
      query: {
        replyToken: string;
      };
      path: {
        videoId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["CommentsResponseDto"];
        };
      };
    };
  };
  PlaylistsController_getPlaylist: {
    parameters: {
      query: {
        pages: number;
      };
      path: {
        playlistId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["PlaylistResultDto"];
        };
      };
    };
  };
  PlaylistsController_getPlaylistContinuation: {
    parameters: {
      query: {
        continuationData: (string)[];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  UserController_getProfile: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["UserprofileDto"];
        };
      };
    };
  };
  UserController_getProfileDetails: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["UserprofileDetailsDto"];
        };
      };
    };
  };
  UserController_getExport: {
    responses: {
      200: never;
    };
  };
  UserController_getProfileImage: {
    parameters: {
      path: {
        username: string;
      };
    };
    responses: {
      200: never;
    };
  };
  UserController_uploadProfileImage: {
    responses: {
      201: never;
    };
  };
  UserController_deleteProfileImage: {
    responses: {
      200: never;
    };
  };
  UserController_deleteUser: {
    responses: {
      200: never;
    };
  };
  UserController_changePassword: {
    responses: {
      201: never;
    };
  };
  SubscriptionsController_getSubscribedChannels: {
    parameters: {
      query: {
        /** @example linu */
        filter?: string;
        /** @example author:1,authorVerified:-1 */
        sort?: string;
        /** @example 0 */
        start?: Record<string, never>;
        /** @example 30 */
        limit?: Record<string, never>;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["SubscribedChannelsResponseDto"];
        };
      };
    };
  };
  SubscriptionsController_getSubscriptionVideos: {
    parameters: {
      query: {
        start?: Record<string, never>;
        limit?: Record<string, never>;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["SubscriptionFeedResponseDto"];
        };
      };
    };
  };
  SubscriptionsController_getSubscription: {
    parameters: {
      path: {
        channelId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["SubscriptionStatusDto"];
        };
      };
    };
  };
  SubscriptionsController_createSubscription: {
    parameters: {
      path: {
        channelId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["SubscriptionStatusDto"];
        };
      };
    };
  };
  SubscriptionsController_deleteSubscription: {
    parameters: {
      path: {
        channelId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["SubscriptionStatusDto"];
        };
      };
    };
  };
  SubscriptionsController_createMultipleSubscriptions: {
    responses: {
      201: never;
    };
  };
  NotificationsController_subscribeToNotifications: {
    responses: {
      201: never;
    };
  };
  SettingsController_getSettings: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["SettingsDto"];
        };
      };
    };
  };
  SettingsController_setSettings: {
    responses: {
      204: never;
    };
  };
  HistoryController_getHistory: {
    parameters: {
      query: {
        sort: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["HistoryResponseDto"];
        };
      };
    };
  };
  HistoryController_deleteEntireHistory: {
    responses: {
      200: never;
    };
  };
  HistoryController_getVideoVisit: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["VideoVisitDto"];
        };
      };
    };
  };
  HistoryController_setVideoVisit: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      201: never;
    };
  };
  HistoryController_deleteHistoryEntry: {
    parameters: {
      path: {
        videoId: string;
      };
    };
    responses: {
      200: never;
    };
  };
  HistoryController_deleteHistoryRange: {
    parameters: {
      path: {
        startDate: string;
        endDate: string;
      };
    };
    responses: {
      200: never;
    };
  };
  AdminController_getLogs: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["LogsDto"];
        };
      };
    };
  };
  AdminController_downloadLogFile: {
    parameters: {
      path: {
        logFile: string;
      };
    };
    responses: {
      200: never;
    };
  };
  AdminController_findAll: {
    responses: {
      200: {
        content: {
          "application/json": (string)[];
        };
      };
    };
  };
  AdminController_create: {
    requestBody: {
      content: {
        "application/json": string;
      };
    };
    responses: {
      201: {
        content: {
          "application/json": string;
        };
      };
    };
  };
  AdminController_isVideoBlocked: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": boolean;
        };
      };
    };
  };
  AdminController_delete: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: never;
    };
  };
  AuthController_login: {
    parameters: {
      query: {
        local: boolean;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UserDto"];
      };
    };
    responses: {
      201: never;
    };
  };
  AuthController_logout: {
    responses: {
      201: never;
    };
  };
  /**
   * Register a new user 
   * @description Request a captcha through the /auth/captcha endpoint,
   *     and pass its token and solution alongside the new user's credentials.
   */
  RegisterController_registerUser: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["RegistrationDto"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  /** Get a captcha */
  CaptchaController_getCaptcha: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["CaptchaDto"];
        };
      };
    };
  };
}
