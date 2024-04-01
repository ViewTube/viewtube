<script setup lang="ts">
const captionsState = inject<CaptionsState>('captionsState');
</script>

<template>
  <div class="flip-setting">
    <VTIcon class="flip-setting-icon" name="mdi:closed-caption" />
    <ListCollapsibleSection label="Subtitles/Closed Captions" opened>
      <div class="selector-list">
        <div
          class="selector"
          :class="{ selected: !captionsState.currentTrackCode }"
          @click.stop="captionsState.selectCaptionsTrack(null)"
        >
          <span>Off</span>
        </div>
        <!-- prettier-ignore-attribute -->
        <div
          v-for="(track, index) in (captionsState.availableCaptionTracks as any)"
          :key="index"
          :class="{ selected: track.active }"
          class="selector"
          @click.stop="captionsState.selectCaptionsTrack(track.languageCode)"
        >
          <span>{{ track.name }}</span>
        </div>
      </div>
    </ListCollapsibleSection>
  </div>
</template>

<style lang="scss" scoped></style>
