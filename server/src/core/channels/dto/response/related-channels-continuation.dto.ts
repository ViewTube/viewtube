import { RelatedChannelsContinuationResponse } from '../../types/ytch.types';
import { RelatedChannelDto } from '../basic/related-channel.dto';

export class RelatedCHannelsContinuationDto implements RelatedChannelsContinuationResponse {
  items: RelatedChannelDto[];
  continuation: string;
}
