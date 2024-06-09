<script setup lang="ts">
import type { ApiDto } from '@viewtube/shared';

const props = defineProps<{
  segment: ApiDto<'SponsorBlockSegmentDto'>;
  videoDuration: number;
}>();

const { getSegmentColor, getSegmentState } = useSponsorBlockUtils();

const backgroundColor = computed(() => {
  return getSegmentColor(props.segment.category);
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
  return getSegmentState(props.segment.category) !== 'none';
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
