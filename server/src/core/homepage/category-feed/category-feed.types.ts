import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { Innertube } from 'youtubei.js';

type HomeCategory = 'music' | 'gaming' | 'sports' | 'podcasts' | 'live' | 'learning' | 'fashion';

export type CategorySource = {
  id: string;
  fetch: (client: Innertube) => Promise<Array<VTVideoDto>>;
};

export type CategoryDefinition = {
  category: HomeCategory;
  sources: Array<CategorySource>;
};
