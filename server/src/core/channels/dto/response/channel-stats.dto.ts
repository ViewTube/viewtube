import type { ChannelStatsResponse } from '../../yt-channel-info/app/types';

export class ChannelStatsDto implements ChannelStatsResponse {
  joinedDate: number;
  viewCount: number;
  location: string;
}
