import { VTChannelLinkDto } from './vt-channel-link.dto';

export class VTChannelAboutDto {
  description?: string;
  joinedDate?: number;
  viewCount?: number;
  location?: string;
  subscribers?: number;
  videoCount?: number;
  links?: Array<VTChannelLinkDto>;
}
