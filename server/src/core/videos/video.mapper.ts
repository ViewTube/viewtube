import { relatedVideo, videoInfo } from 'ytdl-core';
import humanizeDuration from 'humanize-duration';
import { VideoDto } from 'server/core/videos/dto/video.dto';
import { Common } from '../common';
import { generateVideoThumbnails } from 'server/mapper/utils/video-thumbnails';

export const mapVideo = (source: Partial<videoInfo>, dashManifest?: string): VideoDto => {
  const videoDetails = source.videoDetails;

  const playerResponse = source.player_response;

  const playerVideoDetails = playerResponse.videoDetails;

  const microformatData = playerResponse.microformat.playerMicroformatRenderer;

  const durationString = humanizeDuration(
    new Date().valueOf() - Date.parse(videoDetails.publishDate).valueOf(),
    { largest: 1 }
  );
  const publishedText = `${durationString} ago`;

  const isUpcoming =
    playerResponse.playabilityStatus.status === 'LIVE_STREAM_OFFLINE' &&
    new Date(
      (
        playerResponse.playabilityStatus as any
      ).liveStreamability.liveStreamabilityRenderer.offlineSlate.liveStreamOfflineSlateRenderer.scheduledStartTime
    ).valueOf() > Date.now();

  const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  return {
    type: 'video',
    title: videoDetails.title,
    videoId: videoDetails.videoId,
    videoThumbnails: generateVideoThumbnails(videoDetails.videoId),
    storyboards: [],
    description: playerVideoDetails.shortDescription,
    descriptionHtml: playerVideoDetails.shortDescription,
    published: Date.parse(videoDetails.publishDate),
    publishedText,
    keywords: playerVideoDetails.keywords,
    viewCount: parseFloat(playerVideoDetails.viewCount.toString()),
    likeCount: videoDetails.likes ?? 0,
    paid: Boolean((playerResponse as any).paidContentOverlay),
    premium: false, // If it would be premium, it would fail to load
    isFamilyFriendly: microformatData.isFamilySafe,
    genre: videoDetails.media.category,
    genreUrl: Common.removeYoutubeFromUrl(videoDetails.media.category_url),
    author: videoDetails.author.name,
    authorId: videoDetails.author.id,
    authorUrl: `/channel/${videoDetails.author.id}`,
    authorThumbnails: Common.getAuthorThumbnails(videoDetails.author.thumbnails[0].url),
    authorVerified: videoDetails.author.verified,
    allowedRegions: microformatData.availableCountries,
    subCount: videoDetails.author.subscriber_count,
    lengthSeconds: parseInt(videoDetails.lengthSeconds) || 0,
    allowRatings: (playerVideoDetails as any).allowRatings,
    rating: videoDetails.averageRating,
    isListed: !microformatData.isUnlisted,
    liveNow: Boolean(
      playerVideoDetails.isLiveContent &&
        (playerResponse.playabilityStatus as any).liveStreamability
    ),
    isUpcoming,
    adaptiveFormats: source.formats ?? [],
    legacyFormats: source.formats?.filter(value => value.hasAudio && value.hasVideo),
    chapters: source.videoDetails.chapters?.map(chapter => ({
      startTime: chapter.start_time,
      title: chapter.title
    })),
    captions:
      captionTracks?.map(value => ({
        label: value.name.simpleText,
        languageCode: value.languageCode,
        url: `/api/v1/captions/${videoDetails.videoId}?label=${encodeURIComponent(
          value.name.simpleText
        )}`
      })) ?? [],
    recommendedVideos: source.related_videos.map((vid: relatedVideo) => {
      return {
        videoId: vid.id,
        title: vid.title,
        videoThumbnails: generateVideoThumbnails(vid.id),
        author: typeof vid.author === 'string' ? vid.author : vid.author.name,
        authorUrl: `/channel/${vid.id}`,
        authorId: typeof vid.author === 'string' ? '' : vid.author.id,
        authorThumbnails:
          typeof vid.author !== 'string'
            ? Common.getAuthorThumbnailsForRecommended(vid.author.thumbnails[0].url)
            : [],
        lengthSeconds: vid.length_seconds,
        viewCountText: vid.short_view_count_text,
        viewCount: parseInt(vid.view_count)
      };
    }),
    dashManifest: dashManifest
  };
};
