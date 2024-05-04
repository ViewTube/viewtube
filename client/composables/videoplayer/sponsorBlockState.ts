import { useSettingsStore } from '@/store/settings';
import { useSponsorBlockStore } from '@/store/sponsorBlock';
import type { SponsorBlockSegmentDto, SponsorBlockSegmentsDto } from '../../../shared';

export const useSponsorBlockState = (video: Ref<ApiDto<'VTVideoInfoDto'>>) => {
  const { vtFetch } = useVtFetch();
  const { apiUrl } = useApiUrl();
  const sponsorBlockStore = useSponsorBlockStore();
  const settingsStore = useSettingsStore();

  const skipSegments = computed(() => {
    return sponsorBlockStore.getSponsorBlockSegment(video.value.id);
  });

  const loadSkipSegments = async (videoId: string) => {
    if (!settingsStore.sponsorblockEnabled) return;
    if (skipSegments.value) return;

    const url = `${apiUrl.value}videos/${videoId}/skipSegments`;

    vtFetch<SponsorBlockSegmentsDto>(url).then(response => {
      if (response?.segments?.length) {
        sponsorBlockStore.addSponsorBlockSegments(response);
      }
    });
  };

  onBeforeMount(() => {
    loadSkipSegments(video.value.id);
  });

  watch(
    () => video.value.id,
    newVideoId => {
      loadSkipSegments(newVideoId);
    }
  );

  const getCurrentSegment = (time: number): SponsorBlockSegmentDto => {
    const segments = skipSegments.value?.segments;
    if (segments && !isNaN(time)) {
      const currentSegment =
        segments.find(segment => segment.segment[0] <= time && segment.segment[1] >= time) ?? null;
      if (currentSegment) {
        return currentSegment;
      }
    }
    return null;
  };

  return {
    skipSegments,
    getCurrentSegment
  };
};
