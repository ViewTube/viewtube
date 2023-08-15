import path from 'path';
import fs from 'fs';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import humanizeDuration from 'humanize-duration';
import { Job } from 'bull';
import { logger } from 'server/common/logger';
import { generateVideoThumbnails } from 'server/mapper/utils/video-thumbnails';
import { ofetch } from 'ofetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SubscriptionsQueueParams } from './subscriptions.processor';
import { XMLParser } from 'fast-xml-parser';
import { ChannelFeedType } from './types/channel-feed.type';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ''
});

export const runSubscriptionsJob = async (
  uniqueChannelIds: Array<string>,
  job: Job<SubscriptionsQueueParams> = null
): Promise<{
  channelResultArray: Array<ChannelBasicInfoDto>;
  videoResultArray: Array<VideoBasicInfoDto>;
}> => {
  const channelResultArray: Array<ChannelBasicInfoDto> = [];
  const videoRawResultArray: Array<any> = [];
  let videoResultArray: Array<VideoBasicInfoDto> = [];

  const getFeedPromise = async (id: string) => {
    await getChannelFeed(id).then(channelFeed => {
      if (channelFeed) {
        const { videos, channel } = channelFeed;
        channelResultArray.push(channel);
        videoRawResultArray.push(videos);
      }
      return null;
    });
  };

  const channelIdBatches = [];
  uniqueChannelIds = [].concat(...uniqueChannelIds);

  const batchSize = 20;

  while (uniqueChannelIds.length) {
    channelIdBatches.push(uniqueChannelIds.splice(0, batchSize));
  }

  let i = 0;

  logger.log(`Preparing ${channelIdBatches.length} batches for subscriptions job`)

  await channelIdBatches
    .reduce(async (previousPromise: Promise<void>, nextBatch: Array<string>) => {
      await previousPromise;
      const jobProgress = Math.floor((i / channelIdBatches.length) * 100);
      await job.progress(jobProgress);
      i++;
      return Promise.allSettled(
        nextBatch.map(val => {
          return getFeedPromise(val);
        })
      );
    }, Promise.resolve())
    .catch(error => {
      logger.log('job error', error);
    });

  if (videoRawResultArray.length > 0) {
    videoResultArray = videoRawResultArray.reduce(
      (result: any, value: any) => [...result, ...value],
      []
    );
  }
  return { channelResultArray, videoResultArray };
};

const feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

const convertRssVideo = (video: ChannelFeedType['feed']['entry'][number]): VideoBasicInfoDto => {
  const rating = video['media:group']['media:community']['media:starRating'];
  const { likes, dislikes } = convertStarsToLikesDislikes({
    totalRatings: parseInt(rating.count),
    avgStarRatings: parseInt(rating.average)
  });

  const durationString = humanizeDuration(
    new Date().valueOf() - Date.parse(video.published).valueOf(),
    { largest: 1 }
  );

  const description = video['media:group']['media:description'].toString();

  return {
    videoId: video['yt:videoId'].toString(),
    title: video.title,
    author: video.author.name,
    authorId: video['yt:channelId'].toString(),
    description,
    published: Date.parse(video.published),
    publishedText: durationString,
    videoThumbnails: generateVideoThumbnails(video['yt:videoId'].toString()),
    viewCount: parseInt(video['media:group']['media:community']['media:statistics'].views),
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

export const getChannelFeed = async (
  channelId: string
): Promise<{
  channel: ChannelBasicInfoDto;
  videos: Array<VideoBasicInfoDto>;
} | null> => {
  const requestOptions: Record<string, unknown> = {};
  if (process.env.VIEWTUBE_PROXY_URL) {
    const proxy = process.env.VIEWTUBE_PROXY_URL;
    requestOptions.headers = {
      agent: new HttpsProxyAgent(proxy)
    };
  }

  const channelFeed = await ofetch(feedUrl + channelId, requestOptions)
    .then(data => {
      if (data) {
        const jsonData: ChannelFeedType = xmlParser.parse(data);
        if (jsonData.feed) {
          let videos: Array<VideoBasicInfoDto> = [];
          // For channels that have videos
          if (jsonData.feed.entry) {
            videos = jsonData.feed.entry.map(video => convertRssVideo(video));
          }

          const authorId = jsonData.feed?.link
            ?.find(link => link.rel === 'alternate')
            .href.split('channel/')[1];

          const channel: ChannelBasicInfoDto = {
            authorId,
            author: jsonData.feed.author.name,
            authorUrl: jsonData.feed.author.uri
          };

          const cachedChannelThmbPath = path.join(global.__basedir, `channels/${authorId}.webp`);
          if (fs.existsSync(cachedChannelThmbPath)) {
            channel.authorThumbnailUrl = `channels/${authorId}/thumbnail/tiny.webp`;
          } else {
            channel.authorThumbnailUrl = undefined;
          }

          return { channel, videos };
        }
      } else {
        return null;
      }
    })
    .catch(err => logger.warn(`[subscriptions job] Could not fetch channel: ${err}`));
  if (typeof channelFeed === 'object' && channelFeed !== null && channelFeed.channel?.authorId) {
    return channelFeed;
  }
  return null;
};
