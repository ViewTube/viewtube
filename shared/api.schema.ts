/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


/** Type helpers */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type OneOf<T extends any[]> = T extends [infer Only] ? Only : T extends [infer A, infer B, ...infer Rest] ? OneOf<[XOR<A, B>, ...Rest]> : never;

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
    get: operations["ChannelsController_getChannel"];
  };
  "/api/homepage/popular": {
    get: operations["HomepageController_getPopular"];
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

export interface components {
  schemas: {
    VideoThumbnailDto: {
      quality: string;
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
      videoThumbnails: (components["schemas"]["VideoThumbnailDto"])[];
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
      videoThumbnails: (components["schemas"]["VideoThumbnailDto"])[];
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
    RelatedChannelDto: {
      title: string;
      channels: (components["schemas"]["ChannelBasicInfoDto"])[];
    };
    LinkThumbnailDto: {
      url: string;
    };
    ChannelLinkDto: {
      url: string;
      linkThumbnails?: (components["schemas"]["LinkThumbnailDto"])[];
      title: string;
    };
    ChannelDto: {
      author: string;
      authorId: string;
      authorUrl: string;
      authorUsername?: string;
      authorBanners: (components["schemas"]["AuthorThumbnailDto"])[];
      authorThumbnails: (components["schemas"]["AuthorThumbnailDto"])[];
      subCount: number;
      totalViews: number;
      joined: number;
      paid: boolean;
      autoGenerated: boolean;
      isFamilyFriendly: boolean;
      description: string;
      descriptionHtml: string;
      allowedRegions: (string)[];
      videoSections: (Record<string, never>)[];
      relatedChannels: (components["schemas"]["RelatedChannelDto"])[];
      channelLinks?: (components["schemas"]["ChannelLinkDto"])[];
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
      videoThumbnails: (components["schemas"]["VideoThumbnailDto"])[];
      description?: string;
      viewCount: number;
      likeCount?: number;
      dislikeCount?: number;
      lengthSeconds?: number;
      lengthString?: string;
      live?: boolean;
    };
    PopularDto: {
      videos: (components["schemas"]["VideoBasicInfoDto"])[];
      /** Format: date-time */
      updatedAt: string;
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
    };
    SubscriptionStatusDto: {
      channelId: string;
      isSubscribed: boolean;
    };
    VideoVisitDto: {
      videoId: string;
      progressSeconds: number;
      lengthSeconds: number;
      /** Format: date-time */
      lastVisit: string;
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
  ChannelsController_getChannel: {
    parameters: {
      path: {
        id: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["ChannelDto"];
        };
      };
    };
  };
  HomepageController_getPopular: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["PopularDto"];
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
    parameters?: {
        /** @example linu */
        /** @example author:1,authorVerified:-1 */
        /** @example 0 */
        /** @example 30 */
      query?: {
        filter?: string;
        sort?: string;
        start?: Record<string, never>;
        limit?: Record<string, never>;
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
  SubscriptionsController_getSubscriptionVideos: {
    parameters?: {
      query?: {
        start?: Record<string, never>;
        limit?: Record<string, never>;
      };
    };
    responses: {
      200: never;
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
        limit: number;
        start: number;
        sort: string;
        filter: string;
      };
    };
    responses: {
      200: never;
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
  RegisterController_registerUser: {
    /**
     * Register a new user 
     * @description Request a captcha through the /auth/captcha endpoint,
     *     and pass its token and solution alongside the new user's credentials.
     */
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
  CaptchaController_getCaptcha: {
    /** Get a captcha */
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["CaptchaDto"];
        };
      };
    };
  };
}
