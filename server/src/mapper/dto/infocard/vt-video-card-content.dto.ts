import { VTThumbnailDto } from "../vt-thumbnail.dto";

export class VTVideoCardContentDto {
  type: 'video';
  id: string;
  title: string;
  author: {
    name: string;
  }
  viewCount: number;
  thumbnails: Array<VTThumbnailDto>;
  duration: {
    text: string;
    seconds: number;
  }
}