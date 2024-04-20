<script setup lang="ts">
defineProps<{
  captionsState: CaptionsState;
}>();
</script>

<template>
  <div class="flip-setting">
    <VTIcon class="flip-setting-icon" name="mdi:closed-caption" />
    <ListCollapsibleSection label="Subtitles/Closed Captions">
      <div class="selector-list">
        <div
          class="selector"
          :class="{ selected: !captionsState.currentTrackCode }"
          @click.stop="captionsState.selectCaptionsTrack(null)"
        >
          <span>Off</span>
        </div>
        <div
          v-for="(track, index) in captionsState.availableCaptionTracks.value"
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
