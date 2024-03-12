<script setup lang="ts">
import MultiOptionButton from '../buttons/MultiOptionButton.vue';

const videoState = inject<VideoState>('videoState');

const trackListForCurrentLanguage = computed(() => {
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

const availableTracks = computed(() => {
  const tracks = trackListForCurrentLanguage.value.filter(el =>
    el.videoCodec.startsWith(selectedCodec.value)
  );
  // Deduplicate tracks by videoId
  const dedupedTracks = tracks.reduce((acc, track) => {
    if (!acc.find(el => el.videoId === track.videoId)) {
      acc.push(track);
    }
    return acc;
  }, []);

  return dedupedTracks;
});

const audioTracksForCurrentVideoTrack = computed(() => {
  return trackListForCurrentLanguage.value
    .filter(el => el.videoId === currentTrack.value?.videoId)
    .sort((a, b) => a.audioBandwidth - b.audioBandwidth);
});
</script>

<template>
  <div class="flip-setting">
    <VTIcon class="flip-setting-icon" name="mdi:high-definition-box" />
    <ListCollapsibleSection label="Video quality" opened>
      <div class="selector-list">
        <div
          class="selector auto"
          :class="{ selected: videoState.video.automaticQuality }"
          @click.stop="videoState.setAutoQuality(true)"
        >
          Auto<span v-if="videoState.video.automaticQuality">
            · {{ currentTrack?.videoLabel }}</span
          >
        </div>
        <div class="separator-line" />
        <div class="codec-selector">
          <p class="codec-label">Codec</p>
          <MultiOptionButton v-model="selectedCodec" :options="availableCodecs" />
        </div>
        <div
          v-for="(track, index) in availableTracks"
          :key="index"
          :class="{
            selected: track.videoId === currentTrack.videoId && !videoState.video.automaticQuality
          }"
          class="selector"
          @click.stop="videoState.setTrack(track.id)"
        >
          {{ track.videoLabel }}
        </div>
      </div>
    </ListCollapsibleSection>
  </div>
  <div class="flip-setting">
    <VTIcon class="flip-setting-icon" name="mdi:high-definition-box" />
    <ListCollapsibleSection label="Audio quality" opened>
      <div class="selector-list">
        <div
          v-for="(track, index) in audioTracksForCurrentVideoTrack"
          :key="index"
          :class="{ selected: track.active && !videoState.video.automaticQuality }"
          class="selector"
          @click.stop="videoState.setTrack(track.id)"
        >
          {{ track.audioLabel }}
        </div>
      </div>
    </ListCollapsibleSection>
  </div>
</template>

<style lang="scss" scoped>
.separator-line {
  width: 20%;
  height: 1px;
  background-color: var(--bgcolor-alt-light);
  margin: 14px auto 0 auto;
}
.codec-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;

  .codec-label {
    font-size: 0.8rem;
    padding: 0 0 2px 0;
  }
}
</style>
