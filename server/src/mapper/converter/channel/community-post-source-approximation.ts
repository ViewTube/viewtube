import { VTThumbnailDto } from 'server/mapper/dto/vt-thumbnail.dto';

type ThumbnailApproximation = Pick<VTThumbnailDto, 'url' | 'width' | 'height'>;

type TextApproximation = { text?: string } | null;

type PollChoiceApproximation = {
  text?: TextApproximation;
  is_correct?: boolean;
};

/**
 * `BackstageImage` holds one image in several sizes, `PostMultiImage` holds a carousel of them.
 * `Poll` and `Quiz` are the same shape bar the correct answer. `Video` is an ordinary video node,
 * so it goes through the shared video converter rather than being re-extracted here.
 */
export type CommunityPostAttachmentApproximation = {
  type?: string;
  image?: Array<ThumbnailApproximation>;
  images?: Array<{ image?: Array<ThumbnailApproximation> }>;
  choices?: Array<PollChoiceApproximation>;
  total_votes?: TextApproximation;
} | null;

export type CommunityPostApproximation = {
  type?: string;
  id?: string;
  content?: TextApproximation;
  published?: TextApproximation;
  vote_count?: TextApproximation;
  author?: {
    id?: string;
    name?: string;
    thumbnails?: Array<ThumbnailApproximation>;
    is_verified?: boolean;
    is_verified_artist?: boolean;
  } | null;
  action_buttons?: {
    like_button?: { like_count?: number } | null;
    reply_button?: { text?: TextApproximation } | null;
  } | null;
  attachment?: CommunityPostAttachmentApproximation;
};
