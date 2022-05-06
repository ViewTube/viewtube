import { ChannelBasicInfoDto } from './channel-basic-info.dto';

export class RelatedChannelDto {
  title: string;
  channels: Array<ChannelBasicInfoDto>;
}
