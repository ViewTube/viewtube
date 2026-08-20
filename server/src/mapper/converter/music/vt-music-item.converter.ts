import { VTVideoDto } from 'server/mapper/dto/vt-video.dto';
import { parseShortenedNumber } from 'server/mapper/utils/shortened-number';
import { generateVideoThumbnails } from 'server/mapper/utils/video-thumbnails';

type MusicItemAuthor = { name?: string; channel_id?: string };

export type MusicItemApproximation = {
  type?: string;
  id?: string;
  item_type?: string;
  title?: string | { text?: string };
  subtitle?: { text?: string } | null;
  duration?: { text?: string; seconds?: number };
  views?: string;
  authors?: Array<MusicItemAuthor>;
  artists?: Array<MusicItemAuthor>;
  author?: MusicItemAuthor;
};

const extractMusicTitle = (item: MusicItemApproximation): string => {
  if (typeof item?.title === 'string') return item.title;
  return item?.title?.text;
};

/**
 * YTMusic subtitles look like "Ellie Goulding • 629K views", the author is not always
 * available as a structured field.
 */
const subtitleParts = (item: MusicItemApproximation): Array<string> => {
  return (item?.subtitle?.text ?? '')
    .split('•')
    .map(part => part.trim())
    .filter(part => part);
};

const extractMusicAuthor = (item: MusicItemApproximation): VTVideoDto['author'] => {
  const author = item?.authors?.[0] ?? item?.artists?.[0] ?? item?.author;
  const name = author?.name ?? subtitleParts(item)[0];

  if (!author?.channel_id || !name) return undefined;

  return {
    id: author.channel_id,
    name
  };
};

const extractMusicViewCount = (item: MusicItemApproximation): number => {
  const viewCountText = item?.views ?? subtitleParts(item).find(part => /\bviews?\b/i.test(part));

  if (!viewCountText) return undefined;

  return parseShortenedNumber(viewCountText);
};

export const toVTVideoDtoFromMusicItem = (item: MusicItemApproximation): VTVideoDto | null => {
  const id = item?.id;
  const title = extractMusicTitle(item);

  if (!id || !title) return null;

  return {
    id,
    title,
    author: extractMusicAuthor(item),
    thumbnails: generateVideoThumbnails(id),
    duration:
      item?.duration?.seconds && item?.duration?.text
        ? { text: item.duration.text, seconds: item.duration.seconds }
        : undefined,
    viewCount: extractMusicViewCount(item)
  };
};
