<template>
  <div class="sponsorblock-segments">
    <span
      v-for="segment in segments.segments"
      :key="segment.UUID"
      :style="{
        left: `${segment.startPercentage}%`,
        width: `${segment.endPercentage - segment.startPercentage}%`,
        'background-color': getSegmentHexColor(segment.category)
      }"
      class="segment"
    />
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: 'SponsorBlockSegments',
  props: {
    segments: {
      type: Object,
      required: true
    }
  },
  setup() {
    const getSegmentHexColor = (segment: string): string => {
      switch (segment) {
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
    };

    return {
      getSegmentHexColor
    };
  }
});
</script>

<style lang="scss">
.sponsorblock-segments {
  position: absolute;
  left: 0;
  top: calc(50%);
  transform: translateY(-50%);
  width: 100%;
  height: $video-seekbar-line-height;

  .segment {
    display: block;
    position: absolute;
    height: 100%;
  }
}
</style>
