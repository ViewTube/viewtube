<script setup lang="ts">
import MultiOptionButton from '../buttons/MultiOptionButton.vue';
const props = defineProps<{
  videoState: VideoState;
}>();

const currentVideoTrack = computed(() => {
  return props.videoState.video.videoTracks?.find(el => el.active);
});

const audioRepresentations = computed(() => {
  return props.videoState.video.audioTracks
    ?.flatMap(track => {
      return track.representations.map(rep => ({ ...rep, trackId: track.id }));
    })
    .sort((a, b) => a.bitrate - b.bitrate);
});

const currentVideoRepresentation = computed(() => {
  return props.videoState.video.videoTracks
    ?.find(el => el.active)
    ?.representations?.find(el => el.active);
});

const selectedCodec = ref(currentVideoTrack.value?.codec.split('.')[0] || '');

const availableCodecs = computed(() => {
  return [
    ...new Set(
      props.videoState.video.videoTracks.map(el => {
        return el.codec.split('.')[0];
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

const currentVideoRepresentations = computed(() => {
  return selectedVideoTrack.value?.representations;
});

const selectedVideoTrack = computed(() => {
  return props.videoState.video.videoTracks.find(
    el => el.codec.split('.')[0] === selectedCodec.value
  );
});
</script>

<template>
  <div class="flip-setting">
    <VTIcon class="flip-setting-icon" name="mdi:high-definition-box" />
    <ListCollapsibleSection label="Video quality">
      <div class="selector-list">
        <div
          class="selector auto"
          :class="{ selected: videoState.video.automaticVideoQuality }"
          @click.stop="videoState.setAutoVideoQuality()"
        >
          Auto<span v-if="videoState.video.automaticVideoQuality" class="auto-label">
            · {{ currentVideoRepresentation?.label }}</span
          >
        </div>
        <div class="separator-line" />
        <div v-if="availableCodecs?.length > 1" class="codec-selector">
          <p class="codec-label">Codec</p>
          <MultiOptionButton v-model="selectedCodec" :options="availableCodecs" />
        </div>
        <div
          v-for="(representation, index) in currentVideoRepresentations"
          :key="index"
          :class="{
            selected: representation.active && videoState.video.automaticVideoQuality === false
          }"
          class="selector"
          @click.stop="videoState.setVideoRepresentation(selectedVideoTrack.id, representation.id)"
        >
          {{ representation.label }}
          <div v-if="representation.hdr" class="hdr-indicator-container">
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
  <div v-if="audioRepresentations?.length > 0" class="flip-setting">
    <VTIcon class="flip-setting-icon" name="mdi:high-definition-box" />
    <ListCollapsibleSection label="Audio quality">
      <div class="selector-list">
        <div
          v-for="(representation, index) in audioRepresentations"
          :key="index"
          :class="{ selected: representation.active }"
          class="selector"
          @click.stop="videoState.setAudioRepresentation(representation.trackId, representation.id)"
        >
          {{ representation.label }}
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
