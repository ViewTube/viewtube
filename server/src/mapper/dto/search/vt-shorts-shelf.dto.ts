import { VTShortDto } from '../vt-short.dto';

export class VTShortsShelfDto {
  type: 'shorts-shelf';
  title: string;
  items: VTShortDto[];
}
