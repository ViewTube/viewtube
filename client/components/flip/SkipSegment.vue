<script setup lang="ts">
import { useSettingsStore } from '@/store/settings';
import type { SponsorBlockSegmentDto } from '../../../shared';

const props = defineProps<{
  segment: SponsorBlockSegmentDto;
  videoDuration: number;
}>();

const settingsStore = useSettingsStore();

const backgroundColor = computed(() => {
  switch (props.segment.category) {
    case 'sponsor':
      return '#0fca15';
    case 'intro':
      return '#07faf0';
    case 'outro':
      return '#0103e1';
    case 'interaction':
      return '#b711df';
    case 'selfpromo':
      return '#fdfb0e';
    case 'music_offtopic':
      return '#f89c06';
    case 'preview':
      return '#f70000';
    case 'filler':
      return '#7300FF';
    default:
      return '#0fca15';
  }
});

const leftPercent = computed(() => {
  const startPercentage = (props.segment.segment[0] / props.videoDuration) * 100;
  return `${startPercentage}%`;
});

const widthPercent = computed(() => {
  const startPercentage = (props.segment.segment[0] / props.videoDuration) * 100;
  const endPercentage = (props.segment.segment[1] / props.videoDuration) * 100;
  return `${endPercentage - startPercentage}%`;
});

const elementVisible = computed(() => {
  switch (props.segment.category) {
    case 'sponsor':
      return settingsStore.sponsorblockSegmentSponsor !== 'none';
    case 'intro':
      return settingsStore.sponsorblockSegmentIntro !== 'none';
    case 'outro':
      return settingsStore.sponsorblockSegmentOutro !== 'none';
    case 'interaction':
      return settingsStore.sponsorblockSegmentInteraction !== 'none';
    case 'selfpromo':
      return settingsStore.sponsorblockSegmentSelfpromo !== 'none';
    case 'music_offtopic':
      return settingsStore.sponsorblockSegmentMusicOfftopic !== 'none';
    case 'preview':
      return settingsStore.sponsorblockSegmentPreview !== 'none';
    case 'filler':
      return settingsStore.sponsorblockSegmentFiller !== 'none';
    default:
      return true;
  }
});
</script>

<template><div v-if="elementVisible" class="flip-skip-segment"></div></template>

<style lang="scss" scoped>
.flip-skip-segment {
  position: absolute;
  top: 0;
  bottom: 0;
  background-color: v-bind(backgroundColor);
  left: v-bind(leftPercent);
  width: v-bind(widthPercent);
}
</style>
