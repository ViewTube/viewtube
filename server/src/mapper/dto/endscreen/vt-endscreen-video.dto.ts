import { VTEndscreenElementDto } from './vt-endscreen-element.dto';

export class VTEndscreenVideoDto extends VTEndscreenElementDto {
  type: 'video';
  title: string;
  id: string;
  viewCount: number;
  duration: {
    text: string;
    seconds: number;
  };
}
