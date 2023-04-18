import { VTEndscreenElementDto } from './vt-endscreen-element.dto';

export class VTEndscreenVideoDto extends VTEndscreenElementDto {
  type: 'video';
  title: string;
  url: string;
  id: string;
  description: string;
  viewCount: number;
  duration: {
    text: string;
    seconds: number;
  };
}
