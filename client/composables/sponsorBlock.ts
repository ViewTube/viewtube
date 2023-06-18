import { sha256 } from 'js-sha256';
import { SponsorBlockSegmentDto, SponsorBlockSegmentsDto } from 'viewtube/shared';

const sponsorBlockApiUrl = 'https://sponsor.ajay.app/';

export const useSponsorBlock = () => {
  const skipSegments = ref<SponsorBlockSegmentsDto>(null);

  const loadSkipSegments = async (videoId: string) => {
    const hash = sha256.create();
    hash.update(videoId);
    const encodedVideoId = hash.hex();
    const shortHash = encodedVideoId.substring(0, 4);

    const url = `${sponsorBlockApiUrl}api/skipSegments/${shortHash}?categories=["sponsor", "intro", "outro", "interaction", "selfpromo", "music_offtopic", "preview"]`;

    vtFetch<Array<SponsorBlockSegmentsDto>>(url).then(response => {
      if (response) {
        const skipSections = response.find(el => el.videoID === videoId);
        if (skipSections) {
          skipSegments.value = skipSections;
        }
      }
    });
  };

  const getCurrentSegment = (time: number): SponsorBlockSegmentDto => {
    const segments = skipSegments.value?.segments;
    if (segments && !isNaN(time)) {
      const currentSegment =
        segments.find(segment => segment.segment[0] <= time && segment.segment[1] > time) ?? null;
      if (currentSegment) {
        return currentSegment;
      }
    }
    return null;
  };

  return {
    skipSegments,
    loadSkipSegments,
    getCurrentSegment
  };
};
