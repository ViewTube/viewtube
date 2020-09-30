import { LinkThumbnailDto } from './link-thumbnail.dto';

export class ChannelLinkDto {
  url: string;
  linkThumbnails?: Array<LinkThumbnailDto>;

  title: string;
}
