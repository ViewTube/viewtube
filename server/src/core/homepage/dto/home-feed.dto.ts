import type { VTVideoDto } from 'server/mapper/dto/vt-video.dto';

export class HomeFeedDto {
  videos: Array<VTVideoDto>;
}
