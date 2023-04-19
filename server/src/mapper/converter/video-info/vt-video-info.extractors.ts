import { VTVideoInfoDto } from 'server/mapper/dto/vt-video-info.dto';
import { VideoInfoSourceApproximation } from './video-info-source-approximation';
import { parseRedirectUrl } from 'server/mapper/utils/parse-redirect';
import { parseViewCount } from 'server/mapper/utils/view-count';
import { getSecondsFromTimestamp, getTimestampFromSeconds } from 'viewtube/shared';
import { VTEndscreenChannelDto } from 'server/mapper/dto/endscreen/vt-endscreen-channel.dto';
import { VTEndscreenVideoDto } from 'server/mapper/dto/endscreen/vt-endscreen-video.dto';
import { VTVideoCardContentDto } from 'server/mapper/dto/infocard/vt-video-card-content.dto';
import { VTSimpleCardContentDto } from 'server/mapper/dto/infocard/vt-simple-card-content.dto';
import { VTPlaylistCardContentDto } from 'server/mapper/dto/infocard/vt-playlist-card-content.dto';

export const extractVideoId = (videoInfo: VideoInfoSourceApproximation) => {
  return videoInfo?.basic_info?.id;
};

export const extractTitle = (videoInfo: VideoInfoSourceApproximation): string => {
  return videoInfo?.basic_info?.title;
};

export const extractSubtitle = (videoInfo: VideoInfoSourceApproximation): string => {
  let subtitle = '';
  videoInfo?.primary_info?.super_title_link?.runs?.forEach(run => {
    subtitle += run?.text;
  });
  return subtitle;
};

export const extractAuthor = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['author'] => {
  const owner = videoInfo?.secondary_info?.owner;
  const authorHandle = owner?.author?.endpoint?.payload?.canonicalBaseUrl?.replace('/', '');

  return {
    id: videoInfo?.basic_info?.channel_id,
    name: videoInfo?.basic_info?.author,
    handle: authorHandle,
    isArtist: owner?.author?.is_verified_artist === true,
    isVerified: owner?.author?.is_verified === true,
    subscriberCount: owner?.subscriber_count?.text,
    thumbnails: owner?.author?.thumbnails
  };
};

export const extractDescription = (videoInfo: VideoInfoSourceApproximation) => {
  const descriptionParts = videoInfo?.secondary_info?.description?.runs;
  if (!descriptionParts) {
    return videoInfo?.basic_info?.short_description;
  }

  let descriptionText = '';

  descriptionParts.forEach(part => {
    if (!part.endpoint) {
      descriptionText += part.text;
    } else if (part.endpoint.type === 'NavigationEndpoint') {
      if (part.endpoint?.payload?.url) {
        const url = parseRedirectUrl(part.endpoint?.payload?.url);
        descriptionText += url;
      } else if (
        part.endpoint?.metadata?.page_type === 'WEB_PAGE_TYPE_WATCH' &&
        part.endpoint?.payload?.videoId
      ) {
        if (part.endpoint?.payload?.continuePlayback) {
          descriptionText += part.text;
        } else {
          descriptionText += `https://www.youtube.com/watch?v=${part.endpoint?.payload?.videoId}`;
        }
      } else if (part.endpoint?.metadata?.page_type === 'WEB_PAGE_TYPE_CHANNEL') {
        descriptionText += `https://www.youtube.com/channel/${part.endpoint?.payload?.browseId}`;
      } else {
        descriptionText += part.text;
      }
    }
  });

  return descriptionText;
};

export const extractThumbnails = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['thumbnails'] => {
  return videoInfo?.basic_info?.thumbnail;
};

export const extractDuration = (videoInfo: VideoInfoSourceApproximation) => {
  const seconds = videoInfo?.basic_info?.duration;
  const timestamp = getTimestampFromSeconds(seconds);
  return {
    seconds,
    text: timestamp
  };
};

export const extractPublished = (videoInfo: VideoInfoSourceApproximation) => {
  const published = videoInfo?.primary_info?.published?.text;
  const date = new Date(published);
  return {
    text: published,
    date
  };
};

export const extractViewCount = (videoInfo: VideoInfoSourceApproximation) => {
  return (
    videoInfo?.basic_info?.view_count ?? parseViewCount(videoInfo?.primary_info?.view_count?.text)
  );
};

export const extractUpcoming = (videoInfo: VideoInfoSourceApproximation) => {
  if (!videoInfo?.basic_info?.is_upcoming) {
    return null;
  }
};

export const extractLive = (videoInfo: VideoInfoSourceApproximation) => {
  return !!videoInfo?.basic_info?.is_live;
};

export const extractUnlisted = (videoInfo: VideoInfoSourceApproximation) => {
  return !!videoInfo?.basic_info?.is_unlisted;
};

export const extractFamilyFriendly = (videoInfo: VideoInfoSourceApproximation) => {
  return !!videoInfo?.basic_info?.is_family_safe;
};

export const extractLikeCount = (videoInfo: VideoInfoSourceApproximation) => {
  return videoInfo?.basic_info?.like_count;
};

export const extractCategory = (videoInfo: VideoInfoSourceApproximation) => {
  return videoInfo?.basic_info?.category;
};

export const extractPreviewThumbnails = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['previewThumbnails'] => {
  return videoInfo?.storyboards?.boards?.map(storyboard => {
    return {
      urlTemplate: storyboard.template_url,
      width: storyboard.thumbnail_width,
      height: storyboard.thumbnail_height,
      count: storyboard.thumbnail_count,
      columns: storyboard.columns,
      interval: storyboard.interval,
      previewThumbnailCount: storyboard.storyboard_count,
      rows: storyboard.rows
    };
  });
};

export const extractEndscreen = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['endscreen'] => {
  return {
    elements: videoInfo?.endscreen?.elements?.map(element => {
      if (element?.style === 'CHANNEL') {
        return {
          type: 'channel',
          id: element?.endpoint?.payload?.browseId,
          title: element?.title?.text,
          description: element?.metadata?.text,
          thumbnails: element?.image,
          dimensions: {
            aspectRatio: element?.aspect_ratio,
            width: element?.width
          },
          startMs: element?.start_ms,
          endMs: element?.end_ms,
          position: {
            top: element?.top,
            left: element?.left
          }
        } satisfies VTEndscreenChannelDto;
      } else if (element?.style === 'VIDEO') {
        const timestamp = element?.thumbnail_overlays?.find(
          el => el.type === 'ThumbnailOverlayTimeStatus'
        );
        return {
          type: 'video',
          id: element?.endpoint?.payload?.videoId,
          title: element?.title?.text,
          viewCount: parseViewCount(element?.metadata?.text),
          duration: {
            text: timestamp?.text,
            seconds: getSecondsFromTimestamp(timestamp?.text)
          },
          thumbnails: element?.image,
          dimensions: {
            aspectRatio: element?.aspect_ratio,
            width: element?.width
          },
          startMs: element?.start_ms,
          endMs: element?.end_ms,
          position: {
            top: element?.top,
            left: element?.left
          }
        } satisfies VTEndscreenVideoDto;
      }
    }),
    startMs: parseInt(videoInfo?.endscreen?.start_ms)
  };
};

export const extractKeywords = (videoInfo: VideoInfoSourceApproximation) => {
  return videoInfo?.basic_info?.keywords;
};

export const extractCaptions = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['captions'] => {
  return videoInfo?.captions?.caption_tracks?.map(track => {
    return {
      baseUrl: track?.base_url,
      name: track?.name?.text,
      languageCode: track?.language_code
    };
  });
};

export const extractInfoCards = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['infoCards'] => {
  return videoInfo?.cards?.cards
    ?.map(card => {
      const infoCard = {
        shortName: card?.teaser?.message?.text,
        startMs: parseInt(card?.cue_ranges?.[0]?.start_card_active_ms),
        endMs: parseInt(card?.cue_ranges?.[0]?.end_card_active_ms)
      };

      if (card?.content?.type === 'VideoInfoCardContent') {
        return {
          ...infoCard,
          content: {
            type: 'video',
            id: card?.content?.endpoint?.payload?.videoId,
            title: card?.content?.title?.text,
            author: { name: card?.content?.channel_name?.text },
            thumbnails: card?.content?.video_thumbnails,
            viewCount: parseViewCount(card?.content?.view_count?.text),
            duration: {
              text: card?.content?.duration?.text,
              seconds: getSecondsFromTimestamp(card?.content?.duration?.text)
            }
          } satisfies VTVideoCardContentDto
        };
      } else if (card?.content?.type === 'PlaylistInfoCardContent') {
        return {
          ...infoCard,
          content: {
            type: 'playlist',
            id: card?.content?.endpoint?.payload?.playlistId,
            title: card?.content?.title?.text,
            author: { name: card?.content?.channel_name?.text },
            firstVideoId: card?.content?.endpoint?.payload?.videoId,
            videoCount: parseInt(card?.content?.video_count?.text)
          } satisfies VTPlaylistCardContentDto
        };
      } else if (card?.content?.type === 'SimpleCardContent') {
        return {
          ...infoCard,
          content: {
            type: 'simple',
            title: card?.teaser?.message?.text,
            thumbnails: card?.content?.image,
            displayDomain: card?.content?.display_domain?.text,
            url: parseRedirectUrl(card?.content?.endpoint?.payload?.url)
          } satisfies VTSimpleCardContentDto
        };
      }
      return;
    })
    .filter(el => el);
};

export const extractRecommendedVideos = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['recommendedVideos'] => {
  return videoInfo?.watch_next_feed?.map(video => {
    return {
      id: video?.id,
      title: video?.title?.text,
      author: {
        id: video?.author?.id,
        name: video?.author?.name,
        thumbnails: video?.author?.thumbnails,
        isVerified: video?.author?.is_verified,
        isArtist: video?.author?.is_verified_artist,
        handle: video?.author?.endpoint?.payload?.canonicalBaseUrl.replace('/', '')
      }
    };
  });
};

export const extractChapters = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['chapters'] => {
  return videoInfo?.player_overlays?.decorated_player_bar?.player_bar?.markers_map
    ?.find(el => el?.value?.chapters)
    ?.value?.chapters?.map(chapter => {
      return {
        title: chapter?.title?.text,
        startMs: chapter?.time_range_start_millis,
        thumbnails: chapter?.thumbnail
      };
    });
};

export const extractCommentCount = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['commentCount'] => {
  return parseViewCount(videoInfo?.comments_entry_point_header?.comment_count?.text);
};

export const extractLegacyFormats = (
  videoInfo: VideoInfoSourceApproximation
): VTVideoInfoDto['legacyFormats'] => {
  const allFormats = {
    ...videoInfo?.streaming_data?.formats,
    ...videoInfo?.streaming_data?.adaptive_formats
  };

  return allFormats
    ?.filter(format => {
      return format?.has_audio && format?.has_video;
    })
    .map(format => {
      return {
        mimeType: format?.mime_type,
        bitrate: format?.bitrate,
        averageBitrate: format?.average_bitrate,
        width: format?.width,
        height: format?.height,
        lastModified: new Date(format?.last_modified),
        contentLength: format?.content_length,
        quality: format?.quality,
        qualityLabel: format?.quality_label,
        fps: format?.fps,
        url: format?.url,
        audioQuality: format?.audio_quality,
        approxDurationMs: format?.approx_duration_ms,
        audioSampleRate: format?.audio_sample_rate,
        audioChannels: format?.audio_channels,
        hasAudio: format?.has_audio,
        hasVideo: format?.has_video
      };
    });
};
