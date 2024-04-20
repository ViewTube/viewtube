import { defineStore } from 'pinia';
import type { SponsorBlockSegmentsDto } from '../../shared';

export const useSponsorBlockStore = defineStore('sponsorBlock', {
  state: () => ({
    sponsorBlockCache: [] as SponsorBlockSegmentsDto[]
  }),
  getters: {
    getSponsorBlockSegment: state => {
      return (videoId: string) =>
        state.sponsorBlockCache.find(segment => segment.videoID === videoId);
    }
  },
  actions: {
    addSponsorBlockSegments(segments: SponsorBlockSegmentsDto) {
      this.sponsorBlockCache.push(segments);
    }
  }
});
