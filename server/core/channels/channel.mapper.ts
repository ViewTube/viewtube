import { VideoBasicInfoDto } from '../videos/dto/video-basic-info.dto';
import { Common } from '../common';
import { PlaylistBasicInfoDto } from '../playlists/dto/playlist-basic-info.dto';
import { ChannelLinkDto } from './dto/channel-link.dto';
import { ChannelDto } from './dto/channel.dto';
import { ChannelBasicInfoDto } from './dto/channel-basic-info.dto';
import { VideoSectionDto } from './dto/video-section.dto';

export class ChannelMapper {
  static mapChannel(source: any, aboutSource: any): ChannelDto {
    const tabData = aboutSource.contents.twoColumnBrowseResultsRenderer.tabs;
    const aboutTabData = tabData.find(el => el.tabRenderer.title === 'About');
    const homeTabData = source.contents.twoColumnBrowseResultsRenderer.tabs.find(
      el => el.tabRenderer.title === 'Home'
    );
    const metadata = source.metadata.channelMetadataRenderer;
    const header = source.header.c4TabbedHeaderRenderer;

    const author = this.multiValue([metadata.title, header.title]);
    const authorId = this.multiValue([header.channelId, metadata.externalId]);
    const authorUsername = this.multiValue([
      metadata.title,
      header.navigationEndpoint.commandMetadata.webCommandMetadata.url
        .replace('/c/', '')
        .replace('/u/', '')
    ]);
    const allowedRegions = metadata.availableCountryCodes;
    let authorBanners = [];
    if (header.banner) {
      authorBanners = this.mapBanners(header.banner.thumbnails);
    }
    let authorThumbnails = [];
    if (header.avatar) {
      authorThumbnails = header.avatar.thumbnails;
    }
    const authorUrl = `https://youtube.com/channel/${authorId}`;

    // I don't know what properties the following two would be
    const autoGenerated = false;
    const paid = false;
    let channelLinks = [];
    if (header.headerLinks && header.headerLinks.channelHeaderLinksRenderer) {
      channelLinks = this.mapChannelLinks(
        header.headerLinks.channelHeaderLinksRenderer.primaryLinks
      );
    }
    const descriptionHtml = null;
    const isFamilyFriendly = metadata.isFamilySafe;
    let joined = null;
    let totalViews = null;
    let description = '';
    if (aboutTabData && aboutTabData.tabRenderer.content.sectionListRenderer.contents[0]) {
      try {
        const fullMetadata =
          aboutTabData.tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer
            .contents[0].channelAboutFullMetadataRenderer;
        joined = fullMetadata.joinedDateText.runs[1].text;
        description = fullMetadata.description.simpleText;
        totalViews = fullMetadata.viewCountText.simpleText
          .replace('views', '')
          .replace(/,/g, '')
          .trim();
        totalViews = parseInt(totalViews);
      } catch (_) {}
    }
    const videoSections = this.mapVideoSections(
      homeTabData.tabRenderer.content.sectionListRenderer.contents,
      { author, authorId }
    );
    let channelSection = null;
    if (source.contents.twoColumnBrowseResultsRenderer.secondaryContents) {
      channelSection =
        source.contents.twoColumnBrowseResultsRenderer.secondaryContents
          .browseSecondaryContentsRenderer.contents;
    }
    let relatedChannels = [];
    if (channelSection) {
      relatedChannels = this.mapRelatedChannels(channelSection);
    }
    let subCount = null;
    if (header.subscriberCountText) {
      if (header.subscriberCountText.runs) {
        subCount = this.parseAbbreviatedNumber(
          header.subscriberCountText.runs[0].text.replace('subscribers', '').trim()
        );
      } else if (header.subscriberCountText.simpleText) {
        subCount = this.parseAbbreviatedNumber(
          header.subscriberCountText.simpleText.replace('subscribers', '').trim()
        );
      }
    }

    const channel: ChannelDto = {
      author,
      authorId,
      authorUsername,
      allowedRegions,
      authorBanners,
      authorThumbnails,
      authorUrl,
      autoGenerated,
      description,
      descriptionHtml,
      isFamilyFriendly,
      joined,
      videoSections,
      paid,
      relatedChannels,
      subCount,
      totalViews,
      channelLinks
    };
    return channel;
  }

  static multiValue(valueArray: Array<any>): any {
    let definedValue: any = null;
    valueArray.forEach((el: any) => {
      if (el) {
        definedValue = el;
      }
    });
    return definedValue;
  }

  static tryGet(value: Function): any {
    try {
      return value();
    } catch (error) {
      console.log(error);
    }
  }

  static mapRelatedChannels(
    source: any
  ): Array<{ title: string; channels: Array<ChannelBasicInfoDto> }> {
    return source
      .filter(el => el.verticalChannelSectionRenderer)
      .map(miniChannel => {
        const channelSource = miniChannel.verticalChannelSectionRenderer;
        const channels: Array<ChannelBasicInfoDto> = channelSource.items
          .filter(item => item.miniChannelRenderer)
          .map((element: any) => {
            const rawChannel = element.miniChannelRenderer;
            let authorTitle = null;
            if (rawChannel.title) {
              authorTitle = this.multiValue([
                rawChannel.title.simpleText,
                rawChannel.title.runs ? rawChannel.title.runs[0].text : null
              ]);
            }
            let subCount = 0;
            if (rawChannel.subscriberCountText) {
              subCount = this.parseAbbreviatedNumber(rawChannel.subscriberCountText.simpleText);
            }
            const mappedChannel: ChannelBasicInfoDto = {
              authorId: rawChannel.channelId,
              author: authorTitle,
              authorThumbnails: rawChannel.thumbnail.thumbnails,
              subCount,
              videoCount: parseInt(
                rawChannel.videoCountText.runs[0].text.replace('videos', '').trim()
              )
            };
            return mappedChannel;
          });
        return {
          title: channelSource.title,
          channels
        };
      });
  }

  static parseAbbreviatedNumber(string: any) {
    const match = string
      .replace(/,/g, '.')
      .replace(' ', '')
      .match(/([\d,.]+)([MK]?)/);
    if (match) {
      // eslint-disable-next-line prefer-const
      let [, num, multi] = match;
      num = parseFloat(num);
      return multi === 'M' ? num * 1000000 : multi === 'K' ? num * 1000 : num;
    }
    return null;
  }

  static mapVideoSections(source: Array<any>, channel: any): Array<VideoSectionDto> {
    return source
      .filter(
        section =>
          section.itemSectionRenderer.contents.find((el: any) => el.shelfRenderer) ||
          section.itemSectionRenderer.contents.find((el: any) => el.channelVideoPlayerRenderer)
      )
      .map(section => {
        const shelfRendererSource = section.itemSectionRenderer.contents.find(
          (el: any) => el.shelfRenderer
        );
        const videoPlayerSource = section.itemSectionRenderer.contents.find(
          (el: any) => el.channelVideoPlayerRenderer
        );
        if (shelfRendererSource && shelfRendererSource.shelfRenderer) {
          const title = shelfRendererSource.shelfRenderer.title.runs[0].text;
          let elements = [];
          if (shelfRendererSource.shelfRenderer.content) {
            if (shelfRendererSource.shelfRenderer.content.horizontalListRenderer) {
              elements = this.mapSingleSectionContent(
                shelfRendererSource.shelfRenderer.content.horizontalListRenderer.items,
                channel
              );
            } else if (shelfRendererSource.shelfRenderer.content.expandedShelfContentsRenderer) {
              elements = this.mapSingleSectionContent(
                shelfRendererSource.shelfRenderer.content.expandedShelfContentsRenderer.items,
                channel
              );
            }
          }
          return {
            type: 'multi',
            elements,
            title
          };
        } else if (videoPlayerSource && videoPlayerSource.channelVideoPlayerRenderer) {
          const video = this.mapVideoPlayerRendererVideo(
            videoPlayerSource.channelVideoPlayerRenderer,
            channel
          );
          return {
            type: 'single',
            video
          };
        }
        return null;
      });
  }

  static mapVideoPlayerRendererVideo(source: any, channel: any): VideoBasicInfoDto {
    const titleRun = source.title.runs[0];
    const title = titleRun.text;
    const videoId = titleRun.navigationEndpoint.watchEndpoint.videoId;
    const { viewCount, author, lengthSeconds, publishedText } = this.parseAccessibilityText(
      source.title.accessibility.accessibilityData.label,
      title
    );
    const videoThumbnails = Common.getVideoThumbnails(videoId);
    let description = '';
    if (source.description) {
      description = this.concatDescriptionRuns(source.description.runs);
    }

    return {
      author,
      authorId: channel.authorId,
      publishedText,
      title,
      videoId,
      videoThumbnails,
      viewCount,
      lengthSeconds,
      description
    };
  }

  static concatDescriptionRuns(descriptionRuns: Array<any>): string {
    let descriptionString = '';
    descriptionRuns.forEach(run => {
      if (run.navigationEndpoint && run.navigationEndpoint.urlEndpoint) {
        descriptionString += this.cleanTrackingRedirect(run.navigationEndpoint.urlEndpoint.url);
      } else if (run.navigationEndpoint && run.navigationEndpoint.watchEndpoint) {
        descriptionString += `https://youtube.com/watch?v=${run.navigationEndpoint.watchEndpoint.videoId}`;
      } else {
        descriptionString += run.text;
      }
    });
    return descriptionString;
  }

  static mapSingleSectionContent(
    source: Array<any>,
    channel: any
  ): Array<VideoBasicInfoDto | PlaylistBasicInfoDto> {
    return source
      .map(video => {
        if (video.gridVideoRenderer) {
          const vidRenderer = video.gridVideoRenderer;
          return { type: 'video', ...this.mapSectionVideo(vidRenderer, channel) };
        } else if (video.gridPlaylistRenderer) {
          const playlistRenderer = video.gridPlaylistRenderer;
          return { type: 'playlist', ...this.mapSectionPlaylist(playlistRenderer, channel) };
        }
        return null;
      })
      .filter(e => e);
  }

  static mapSectionPlaylist(source: any, channel: any): PlaylistBasicInfoDto {
    const author = channel.author;
    const authorId = channel.authorId;
    const playlistId = source.playlistId;
    const firstVideoId = source.title.runs[0].navigationEndpoint.watchEndpoint.videoId;
    const playlistVideoLink = `/watch?v=${firstVideoId}&list=${playlistId}`;
    const playlistLink = `/playlist?list=${playlistId}`;
    const title = source.title.runs[0].text;
    const videoCountText = source.videoCountText.runs[0].text.replace(/videos?/gi, '').trim();
    const videoCount = parseInt(videoCountText);
    const playlistThumbnails = Common.getVideoThumbnails(firstVideoId);
    let previewVideos = [];
    if (source.sidebarThumbnails) {
      previewVideos = source.sidebarThumbnails.map(thumb => {
        const videoIdMatch = thumb.thumbnails[0].url.match(/\/vi\/(.*?)\//i);
        let videoThumbnails = thumb.thumbnails.map(el => ({
          url: `https:${el.url}`,
          width: el.width,
          height: el.height
        }));
        let videoId = null;
        if (videoIdMatch) {
          videoId = videoIdMatch[1];
          videoThumbnails = Common.getVideoThumbnails(videoId).concat(videoThumbnails);
        }
        return {
          videoId,
          videoThumbnails
        };
      });
    }
    return {
      author,
      authorId,
      playlistId,
      playlistLink,
      playlistVideoLink,
      playlistThumbnails,
      title,
      videoCount,
      firstVideoId,
      previewVideos
    };
  }

  static mapSectionVideo(source: any, channel: any): VideoBasicInfoDto {
    const title = source.title.simpleText;
    let altPublishedText = null;
    if (source.publishedTimeText) {
      altPublishedText = source.publishedTimeText.simpleText;
    }
    let published = null;
    if (source.upcomingEventData) {
      published = source.upcomingEventData.startTime;
    }
    const videoId = source.navigationEndpoint.watchEndpoint.videoId;
    const videoThumbnails = Common.getVideoThumbnails(videoId);
    const { viewCount, author, lengthSeconds, publishedText } = this.parseAccessibilityText(
      source.title.accessibility.accessibilityData.label,
      title
    );

    if (!altPublishedText) {
      altPublishedText = publishedText;
    }

    return {
      title,
      author,
      authorId: channel.authorId,
      publishedText: altPublishedText,
      videoId,
      videoThumbnails,
      viewCount,
      lengthSeconds,
      published
    };
  }

  static parseAccessibilityText(
    text: string,
    videoName: string
  ): { author: string; lengthSeconds: number; publishedText: string; viewCount: number } {
    const viewCountRegex = /(\d+|\d{1,3}(,\d{3})*)(\.\d+)?\sviews?/i;
    const secondsRegex = /(\d{1,2})\sseconds?/i;
    const minutesRegex = /(\d{1,2})\sminutes?/i;
    const hoursRegex = /(\d{1,2})\shours?/i;
    const publishedTextRegex = /\d.*?ago/gi;
    const authorRegex = /by\s(.*)/i;

    const stringwithoutName = text.replace(videoName, '').trim();

    const viewCountMatch = stringwithoutName.match(viewCountRegex);
    const viewCountString = viewCountMatch ? viewCountMatch[1] : '';
    const viewCount = parseInt(viewCountString.replace(/,/g, ''));
    let stringWithoutViews = stringwithoutName.replace(viewCountRegex, '').replace(/,/g, '').trim();

    const secondsMatch = stringWithoutViews.match(secondsRegex);
    const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
    stringWithoutViews = stringWithoutViews.replace(secondsRegex, '').trim();

    const minutesMatch = stringWithoutViews.match(minutesRegex);
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    stringWithoutViews = stringWithoutViews.replace(minutesRegex, '').trim();

    const hoursMatch = stringWithoutViews.match(hoursRegex);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    stringWithoutViews = stringWithoutViews.replace(hoursRegex, '').trim();

    const lengthSeconds = seconds + minutes * 60 + hours * 3600;

    const publishedTextMatch = stringWithoutViews.match(publishedTextRegex);
    const publishedText = publishedTextMatch ? publishedTextMatch[0] : null;
    stringWithoutViews = stringWithoutViews.replace(publishedTextRegex, '').trim();

    const authorMatch = stringWithoutViews.match(authorRegex);
    const author = authorMatch ? authorMatch[1] : null;

    return { author, lengthSeconds, publishedText, viewCount };
  }

  static mapChannelLinks(source: Array<any>): Array<ChannelLinkDto> {
    if (source) {
      return source.map(el => {
        return {
          title: el.title.simpleText,
          url: this.cleanTrackingRedirect(el.navigationEndpoint.urlEndpoint.url),
          linkThumbnails: el.icon.thumbnails.map(thmb => ({ url: `https:${thmb.url}` }))
        };
      });
    }
    return [];
  }

  static cleanTrackingRedirect(source: string): string {
    const encodedUrl = source.replace(/\/redirect.*?q=/gi, '').replace(/&.*/gi, '');
    return decodeURIComponent(encodedUrl);
  }

  static mapBanners(
    source: Array<{ url: string; width: number; height: number }>
  ): Array<{ url: string; width: number; height: number }> {
    return source.map(el => {
      const url = el.url.match(/https?:\/\/.*/) ? el.url : `https:${el.url}`;
      return {
        url,
        height: el.height,
        width: el.width
      };
    });
  }
}
