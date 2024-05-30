import type { ApiDto } from '@viewtube/shared';
import { defineStore } from 'pinia';

export const useSponsorBlockStore = defineStore('sponsorBlock', {
  state: () => ({
    sponsorBlockCache: [] as ApiDto<'SponsorBlockSegmentsDto'>[]
  }),
  getters: {
    getSponsorBlockSegment: state => {
      return (videoId: string) =>
        state.sponsorBlockCache.find(segment => segment.videoID === videoId);
    }
  },
  actions: {
    addSponsorBlockSegments(segments: ApiDto<'SponsorBlockSegmentsDto'>) {
      this.sponsorBlockCache.push(segments);
    }
  }
});
