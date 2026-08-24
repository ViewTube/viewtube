import { VTChannelDto } from '../vt-channel.dto';
import { VTThumbnailDto } from '../vt-thumbnail.dto';
import { VTChannelLinkDto } from './vt-channel-link.dto';

export class VTChannelPageDto extends VTChannelDto {
  banners?: Array<VTThumbnailDto>;
  subscriberText?: string;
  isFamilyFriendly?: boolean;
  tags?: Array<string>;
  allowedRegions?: Array<string>;
  links?: Array<VTChannelLinkDto>;
  tabs?: Array<string>;
}
