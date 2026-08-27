<script setup lang="ts">
const props = defineProps<{
  videoState: VideoState;
}>();

/**
 * One flat list, highest first.
 *
 * There is no codec picker and no separate audio list any more: with SABR the server runs
 * the ABR and picks the codec and the audio bitrate itself, so those were controls over
 * something the client does not decide. The adapter already collapses its ladder to one
 * entry per resolution; flattening here keeps the legacy DASH path — which still reports a
 * track per codec — rendering in the same single list.
 */
const qualities = computed(() =>
  (props.videoState.video.videoTracks ?? [])
    .flatMap(track =>
      track.representations.map(representation => ({ ...representation, trackId: track.id }))
    )
    .sort((a, b) => b.height - a.height || b.bitrate - a.bitrate)
);

const activeQuality = computed(() => qualities.value.find(quality => quality.active));
</script>

<template>
  <div class="flip-setting">
    <VTIcon class="flip-setting-icon" name="mdi:high-definition-box" />
    <ListCollapsibleSection label="Quality" opened>
      <div class="selector-list">
        <div
          class="selector auto"
          :class="{ selected: videoState.video.automaticVideoQuality }"
          @click.stop="videoState.setVideoQuality(activeQuality?.trackId, null)"
        >
          Auto<span v-if="videoState.video.automaticVideoQuality" class="auto-label">
            · {{ activeQuality?.label }}</span
          >
        </div>
        <div class="separator-line" />
        <div
          v-for="quality in qualities"
          :key="quality.id"
          :class="{
            selected: quality.active && videoState.video.automaticVideoQuality === false
          }"
          class="selector"
          @click.stop="videoState.setVideoQuality(quality.trackId, quality.id)"
        >
          {{ quality.label }}
          <div v-if="quality.hdr" class="hdr-indicator-container">
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
</template>

<style lang="scss" scoped>
.separator-line {
  width: 20%;
  height: 1px;
  background-color: var(--bgcolor-alt-light);
  margin: 14px auto 0 auto;
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

    background:
      radial-gradient(
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
    background:
      radial-gradient(
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
