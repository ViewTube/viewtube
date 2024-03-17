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
          Auto<span v-if="videoState.video.automaticQuality" class="auto-label">
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
          <div v-if="track.hdr" class="hdr-indicator-container">
            <div class="hdr-indicator-bg">
              <div class="hdr-indicator-bg-inner">
                <div class="hdr-indicator">HDR</div>
              </div>
            </div>
          </div>
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

.auto-label {
  margin-left: 5px;
}

.hdr-indicator-container {
  position: relative;

  .hdr-indicator-bg {
    --indicator-width: 34px;
    --indicator-height: 18px;

    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: var(--indicator-width);
    height: var(--indicator-height);
    margin-left: 5px;
    border-radius: 4px;

    background: radial-gradient(
        ellipse farthest-corner at right bottom,
        #fedb37 0%,
        #fdb931 8%,
        #9f7928 30%,
        #8a6e2f 40%,
        transparent 80%
      ),
      radial-gradient(
        ellipse farthest-corner at left top,
        #ffffff 0%,
        #ffffac 8%,
        #d1b464 25%,
        #5d4a1f 62.5%,
        #5d4a1f 100%
      );
  }

  .hdr-indicator-bg-inner {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: calc(var(--indicator-height) - 2px);
    width: calc(var(--indicator-width) - 2px);
    margin-left: 1px;
    border-radius: 3px;
    background-color: var(--bgcolor-alt);
  }

  .hdr-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--bgcolor-alt);
    font-size: 0.8rem;
    font-weight: bold;
    background: radial-gradient(
        ellipse farthest-corner at right bottom,
        #fedb37 0%,
        #fdb931 8%,
        #9f7928 30%,
        #8a6e2f 40%,
        transparent 80%
      ),
      radial-gradient(
        ellipse farthest-corner at left top,
        #ffffff 0%,
        #ffffac 8%,
        #d1b464 25%,
        #5d4a1f 62.5%,
        #5d4a1f 100%
      );

    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-flex;
  }
}
</style>
