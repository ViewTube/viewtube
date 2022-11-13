import { ChannelBasicInfoDto } from 'server/core/channels/dto/channel-basic-info.dto';

export class SubscribedChannelsResponseDto {
  channels: Array<ChannelBasicInfoDto>;
  channelCount: number;
}
