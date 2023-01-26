import { ChannelInfoDto } from './channel-info.dto';

export class RelatedChannelsContinuationDto {
  items: Array<Partial<ChannelInfoDto['relatedChannels']['items'][number]>>;
  continuation: string;
}
