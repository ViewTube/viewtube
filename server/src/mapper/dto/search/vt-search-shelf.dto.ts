import type { VTSearchVideoResultDto } from './vt-search-video-result.dto';

export class VTSearchShelfDto {
  type: 'shelf';
  title: string;
  items: VTSearchVideoResultDto[];
}
