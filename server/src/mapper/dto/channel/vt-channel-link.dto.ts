import { VTThumbnailDto } from '../vt-thumbnail.dto';

export class VTChannelLinkDto {
  title: string;
  url: string;
  favicons?: Array<VTThumbnailDto>;
}
