import { VTEndscreenElementDto } from './vt-endscreen-element.dto';

export class VTEndscreenChannelDto extends VTEndscreenElementDto {
  type: 'channel';
  title: string;
  id: string;
  description: string;
}
