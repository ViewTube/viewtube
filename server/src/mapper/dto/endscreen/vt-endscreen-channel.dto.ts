import { VTEndscreenElementDto } from './vt-endscreen-element.dto';

export class VTEndscreenChannelDto extends VTEndscreenElementDto {
  type: 'channel';
  title: string;
  url: string;
  handle: string;
  id: string;
  description: string;
}
