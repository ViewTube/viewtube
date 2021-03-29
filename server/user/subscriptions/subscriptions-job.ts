import path from 'path';
import fs from 'fs';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import X2js from 'x2js';
import fetch from 'node-fetch';
import humanizeDuration from 'humanize-duration';
import { Common } from 'server/core/common';
import Consola from 'consola';

export const runSubscriptionsJob = async (
  uniqueChannelIds: Array<string>
): Promise<{
  channelResultArray: Array<ChannelBasicInfoDto>;
  videoResultArray: Array<VideoBasicInfoDto>;
}> => {
  const channelResultArray: Array<ChannelBasicInfoDto> = [];
  let videoResultArray: Array<VideoBasicInfoDto> = [];

  const feedRequests = uniqueChannelIds.map(async (id: string) => {
    await getChannelFeed(id).then(channelFeed => {
      if (channelFeed) {
        const { videos, channel } = channelFeed;
        channelResultArray.push(channel);
        return videos;
      }
      return null;
    });
  });

  const promiseResults = (await Promise.allSettled(feedRequests)) as any;
  if (promiseResults.find((promiseResult: { value: any }) => promiseResult.value)) {
    const videoValues = promiseResults.filter(
      (promiseResult: { value: any }) => promiseResult.value
    );
    videoResultArray = videoValues.reduce(
      (promiseResult: any, { value }: any) => [...promiseResult, ...value],
      []
    );
  }
  return { channelResultArray, videoResultArray };
};

const feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

const convertRssVideo = (video: any): VideoBasicInfoDto => {
  const rating = video.group.community.starRating;
  const { likes, dislikes } = convertStarsToLikesDislikes({
    totalRatings: rating._count,
    avgStarRatings: rating._average
  });

  const durationString = humanizeDuration(
    new Date().valueOf() - Date.parse(video.published).valueOf(),
    { largest: 1 }
  );

  const description = video.group.description.toString();
  const descriptionText = typeof description === 'string' ? description : '';

  return {
    videoId: video.videoId.toString(),
    title: video.title,
    author: video.author.name,
    authorId: video.channelId.toString(),
    description: descriptionText,
    published: Date.parse(video.published),
    publishedText: durationString,
    videoThumbnails: Common.getVideoThumbnails(video.videoId.toString()),
    viewCount: video.group.community.statistics._views,
    likeCount: likes,
    dislikeCount: dislikes
  };
};

const convertStarsToLikesDislikes = ({
  totalRatings,
  avgStarRatings
}: {
  totalRatings: number;
  avgStarRatings: number;
}): { likes: number; dislikes: number } => {
  const likeRatio = (avgStarRatings - 1) / 4;
  const likes = Math.round(totalRatings * likeRatio);
  const dislikes = Math.round(totalRatings * (1 - likeRatio));
  return { likes, dislikes };
};

export const getChannelFeed = (
  channelId: string
): Promise<void | {
  channel: ChannelBasicInfoDto;
  videos: Array<VideoBasicInfoDto>;
}> => {
  return fetch(feedUrl + channelId)
    .then(response => {
      if (response.ok) {
        return response.text();
      }
      return null;
    })
    .then(data => {
      if (data) {
        const x2js = new X2js();
        const jsonData = x2js.xml2js(data) as any;
        if (jsonData.feed.entry) {
          let videos: Array<VideoBasicInfoDto> = [];
          // For channels that have no videos
          if (jsonData.feed.entry.length) {
            videos = jsonData.feed.entry.map((video: any) => convertRssVideo(video));
          }

          const authorId = jsonData.feed.channelId.toString();

          const channel: ChannelBasicInfoDto = {
            authorId,
            author: jsonData.feed.author.name,
            authorUrl: jsonData.feed.author.uri
          };

          const cachedChannelThmbPath = path.join(
            (global as any).__basedir,
            `channels/${authorId}.jpg`
          );
          if (fs.existsSync(cachedChannelThmbPath)) {
            channel.authorThumbnailUrl = `channels/${authorId}/thumbnail/tiny.jpg`;
          } else {
            channel.authorThumbnailUrl = undefined;
          }

          return { channel, videos };
        }
      } else {
        return null;
      }
    })
    .catch(err =>
      Consola.warn(`Could not find channel, the following error can be safely ignored:\n${err}`)
    );
};
