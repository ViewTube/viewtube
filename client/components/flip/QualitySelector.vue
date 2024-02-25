<script setup lang="ts">
import MultiOptionButton from '../buttons/MultiOptionButton.vue';

const videoState = inject<VideoState>('videoState');

const trackListForCurrentLanguage = computed(() => {
  console.log(videoState.video.trackList);
  console.log(videoState.video.selectedLanguage);
  const currentLanguage = videoState.video.selectedLanguage;
  const trackList = videoState.video.trackList[currentLanguage];
  if (!trackList) {
    return videoState.video.trackList[Object.keys(videoState.video.trackList)[0]];
  }
  return trackList;
});

const currentTrack = computed(() => {
  return trackListForCurrentLanguage.value?.find(el => el.active);
});

const selectedCodec = ref(currentTrack.value?.videoCodec.split('.')[0] || '');

const availableCodecs = computed(() => {
  return [
    ...new Set(
      trackListForCurrentLanguage.value.map(el => {
        return el.videoCodec.split('.')[0];
      })
    )
  ].map(el => {
    return {
      value: el?.toString() || '',
      label: translateCodec(el?.toString()) || ''
    };
  });
});

const translateCodec = (codec: string) => {
  switch (codec) {
    case 'avc1':
    case 'avc01':
    case 'avc':
      return 'H.264';
    case 'hevc':
      return 'H.265';
    case 'av01':
      return 'AV1';
    case 'vp09':
    case 'vp9':
      return 'VP9';
    default:
      return codec;
  }
};

const availableTracks = computed(() =>
  trackListForCurrentLanguage.value.filter(el => el.videoCodec.startsWith(selectedCodec.value))
);
</script>

<template>
  <div class="selector-list">
    <div
      class="selector auto"
      :class="{ selected: videoState.video.automaticQuality }"
      @click.stop="videoState.setAutoQuality(true)"
    >
      Auto<span v-if="videoState.video.automaticQuality"> - {{ currentTrack?.label }}</span>
    </div>
    <div class="codec-selector">
      codec
      <MultiOptionButton v-model="selectedCodec" :options="availableCodecs" />
    </div>
    <div
      v-for="(track, index) in availableTracks"
      :key="index"
      :class="{ selected: track.active && !videoState.video.automaticQuality }"
      class="selector"
      @click.stop="videoState.setTrack(track.id)"
    >
      {{ track.label }}
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
