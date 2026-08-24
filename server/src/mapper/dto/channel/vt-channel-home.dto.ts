import { VTVideoDto } from '../vt-video.dto';
import { VTChannelShelfDto } from './vt-channel-shelf.dto';

export class VTChannelHomeDto {
  featuredVideo?: VTVideoDto;
  shelves: Array<VTChannelShelfDto>;
}
