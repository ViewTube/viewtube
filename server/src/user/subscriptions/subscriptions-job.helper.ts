import { Job } from 'bull';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import humanizeDuration from 'humanize-duration';
import path from 'path';
import { logger } from 'server/common/logger';
import { vtFetch } from 'server/common/vtFetch';
import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';
import { VideoBasicInfoDto } from 'server/core/videos/dto/video-basic-info.dto';
import { generateVideoThumbnails } from 'server/mapper/utils/video-thumbnails';
import { SubscriptionsQueueParams } from './subscriptions.processor';
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

  if (!job.data?.silent) {
    logger.log(`Preparing ${channelIdBatches.length} batches for subscriptions job`);
  }

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
  const channelFeed = await fetchChannelFeed(channelId);

  if (channelFeed.channelFeed) {
    const jsonData: ChannelFeedType = xmlParser.parse(channelFeed.channelFeed);
    if (jsonData.feed) {
      let videos: Array<VideoBasicInfoDto> = [];

      if (jsonData.feed.entry) {
        videos = jsonData.feed.entry.map(convertRssVideo);
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
    } else {
      logger.warn(`[subscriptions job] Could not fetch channel: ${channelFeed.requestError}`);
    }
  }
  return null;
};

const fetchChannelFeed = async (
  channelId: string
): Promise<{
  channelFeed: string | null;
  requestError: string | null;
}> => {
  let requestError = null;
  let i = 0;

  let channelFeed = null;

  do {
    i++;
    try {
      const feedResponse = await vtFetch(`${feedUrl}${channelId}`, { useProxy: true });
      const feed = await feedResponse.body.text();

      if (typeof feed === 'string') {
        channelFeed = feed;
        requestError = null;
      }
    } catch (error) {
      requestError = error;
    }
  } while (requestError?.includes('429') || i < 5);

  return {
    channelFeed,
    requestError
  };
};
