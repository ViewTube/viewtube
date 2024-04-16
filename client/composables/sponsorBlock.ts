import { SponsorBlockSegmentDto, SponsorBlockSegmentsDto } from '../../shared';

export const useSponsorBlock = () => {
  const { vtFetch } = useVtFetch();
  const { apiUrl } = useApiUrl();

  const skipSegments = ref<SponsorBlockSegmentsDto>(null);

  const loadSkipSegments = async (videoId: string) => {
    const url = `${apiUrl}videos/${videoId}/skipSegments`;

    vtFetch<SponsorBlockSegmentsDto>(url).then(response => {
      if (response) {
        skipSegments.value = response;
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
