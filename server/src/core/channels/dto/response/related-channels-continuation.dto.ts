import type { RelatedChannelDto } from '../basic/related-channel.dto';

export class RelatedChannelsContinuationDto {
  items: Array<Partial<RelatedChannelDto>>;
  continuation: string;
}
