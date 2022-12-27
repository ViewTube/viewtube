import { RelatedChannelsContinuationResponse } from '../../types/ytch.types';
import { RelatedChannelDto } from '../basic/related-channel.dto';

export class RelatedChannelsContinuationDto implements RelatedChannelsContinuationResponse {
  items: RelatedChannelDto[];
  continuation: string;
}
