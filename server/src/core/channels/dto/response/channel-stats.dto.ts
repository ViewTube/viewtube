import { ChannelStatsResponse } from '../../types/ytch.types';

export class ChannelStatsDto implements ChannelStatsResponse {
  joinedDate: number;
  viewCount: number;
  location: string;
}
