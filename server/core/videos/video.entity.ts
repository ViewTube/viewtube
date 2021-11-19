import { relatedVideo, videoInfo } from 'ytdl-core';
import { Expose, Exclude } from 'class-transformer';
import humanizeDuration from 'humanize-duration';
import { AuthorThumbnailDto } from 'viewtube/shared/dto/video/author-thumbnail.dto';
import { VideoDto } from 'viewtube/shared/dto/video/video.dto';
import { VideoThumbnailDto } from 'viewtube/shared/dto/video/video-thumbnail.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RecommendedVideoDto } from 'viewtube/shared/dto/video/recommended-video.dto';
import { ChapterDto } from 'viewtube/shared/dto/video/chapter.dto';
import { Common } from '../common';

export class VideoEntity implements VideoDto {
  constructor(private _source: Partial<videoInfo>, private _dashManifest?: string) {}

  private _videoDetails = this._source.videoDetails;

  @Exclude()
  playerResponse = this._source.player_response;

  @Exclude()
  playerVideoDetails = this.playerResponse.videoDetails;

  @Exclude()
  microformatData = this.playerResponse.microformat.playerMicroformatRenderer;

  type = 'video';

  title: string = this._videoDetails.title;

  videoId: string = this._videoDetails.videoId;

  videoThumbnails: Array<VideoThumbnailDto> = Common.getVideoThumbnails(this._videoDetails.videoId);

  storyboards: Array<any> = [];

  description: string = this.playerVideoDetails.shortDescription;

  descriptionHtml: string = this.playerVideoDetails.shortDescription;

  published: number = Date.parse(this._videoDetails.publishDate);

  @Expose()
  get publishedText(): string {
    const durationString = humanizeDuration(
      new Date().valueOf() - Date.parse(this._videoDetails.publishDate).valueOf(),
      { largest: 1 }
    );
    return `${durationString} ago`;
  }

  keywords: Array<string> = this.playerVideoDetails.keywords;

  @Expose()
  get viewCount(): number {
    // Result of viewCount not predictable
    return parseFloat(this.playerVideoDetails.viewCount.toString());
  }

  likeCount: number = this._videoDetails.likes || 0;

  dislikeCount: number = this._videoDetails.dislikes || 0;

  @Expose()
  get paid(): boolean {
    return (this.playerResponse as any).paidContentOverlay !== undefined;
  }

  premium = false; // If it would be premium, it would fail to load

  isFamilyFriendly: boolean = this.microformatData.isFamilySafe;

  genre: string = this._videoDetails.media.category;

  genreUrl: string = Common.removeYoutubeFromUrl(this._videoDetails.media.category_url);

  author: string = this._videoDetails.author.name;

  authorId: string = this._videoDetails.author.id;

  authorUrl: string = '/channel/' + this._videoDetails.author.id;

  authorThumbnails: Array<AuthorThumbnailDto> = Common.getAuthorThumbnails(
    this._videoDetails.author.thumbnails[0].url
  );

  authorVerified: boolean = this._videoDetails.author.verified;

  allowedRegions: Array<string> = this.microformatData.availableCountries;

  subCount: number = this._videoDetails.author.subscriber_count;

  lengthSeconds: number = parseInt(this._videoDetails.lengthSeconds) || 0;

  allowRatings: boolean = (this.playerVideoDetails as any).allowRatings;

  rating: number = this._videoDetails.averageRating;

  isListed = !this.microformatData.isUnlisted;

  liveNow = Boolean(
    this.playerVideoDetails.isLiveContent &&
      (this.playerResponse.playabilityStatus as any).liveStreamability
  );

  @Expose()
  get isUpcoming(): boolean {
    return (
      this.playerResponse.playabilityStatus.status === 'LIVE_STREAM_OFFLINE' &&
      new Date(
        (
          this.playerResponse.playabilityStatus as any
        ).liveStreamability.liveStreamabilityRenderer.offlineSlate.liveStreamOfflineSlateRenderer.scheduledStartTime
      ).valueOf() > Date.now()
    );
  }

  dashUrl: string = 'https://invidio.us/api/manifest/dash/id/' + this._videoDetails.videoId;

  @Expose()
  get adaptiveFormats(): Array<any> {
    if (this._source.formats) {
      return this._source.formats;
    } else {
      return [];
    }
  }

  @Expose()
  get legacyFormats(): Array<any> {
    return this._source.formats.filter(value => {
      return value.hasAudio && value.hasVideo;
    });
  }

  @Expose()
  get chapters(): Array<ChapterDto> {
    if (this._source.videoDetails.chapters && this._source.videoDetails.chapters.length > 0) {
      return this._source.videoDetails.chapters.map(chapter => ({
        startTime: chapter.start_time,
        title: chapter.title
      }));
    }
    return [];
  }

  @Expose()
  get captionTracks(): Array<any> {
    if (
      this.playerResponse.captions &&
      this.playerResponse.captions.playerCaptionsTracklistRenderer
    ) {
      return this.playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
    }
    return [];
  }

  captions: Array<any> = this.captionTracks
    ? this.captionTracks.map(value => {
        return {
          label: value.name.simpleText,
          languageCode: value.languageCode,
          url: `/api/v1/captions/${this._videoDetails.videoId}?label=${encodeURIComponent(
            value.name.simpleText
          )}`
        };
      })
    : [];

  @Expose()
  get recommendedVideos(): Array<RecommendedVideoDto> {
    return this._source.related_videos.map(vid => {
      const video = vid as relatedVideo;
      return {
        videoId: video.id,
        title: video.title,
        videoThumbnails: Common.getVideoThumbnails(video.id),
        author: typeof video.author === 'string' ? video.author : video.author.name,
        authorUrl: `/channel/${video.id}`,
        authorId: typeof video.author === 'string' ? '' : video.author.id,
        authorThumbnails:
          typeof video.author !== 'string'
            ? Common.getAuthorThumbnailsForRecommended(video.author.thumbnails[0].url)
            : [],
        lengthSeconds: video.length_seconds,
        viewCountText: video.short_view_count_text,
        viewCount: parseInt(video.view_count)
      };
    });
  }

  @Expose()
  get dashManifest(): string {
    if (this._dashManifest) {
      return this._dashManifest;
    }
    return null;
  }
}
