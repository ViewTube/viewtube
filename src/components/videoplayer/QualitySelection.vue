<template>
  <div class="quality" @mouseup.stop="onQualityMouseup">
    <SettingsIcon @click.stop="onQualityInteraction" @touchend.stop="onQualityTouchInteraction" />
    <div
      class="quality-popup"
      v-if="popup"
      ref="qualityPopup"
      :style="{ top: `${$refs.qualityPopup.clientHeight + 40}px` }"
    >
      <div class="quality-submenu">
        <span>Adaptive dash</span>
        <div>
          <p>Max: {{ maxAdaptiveQuality.qualityLabel }}</p>
          <p>Min: {{ minAdaptiveQuality.qualityLabel }}</p>
        </div>
      </div>
      <div class="quality-submenu">
        <span>Legacy format</span>
        <div
          class="format-quality-entry"
          v-for="(quality, id) in formatStreams"
          :key="id"
        >{{ quality.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import SettingsIcon from 'icons/Settings'

export default {
  name: 'quality-selection',
  components: {
    SettingsIcon
  },
  props: {
    formatStreams: Array,
    adaptiveFormats: Array
  },
  data: () => ({
    qualityUrl: null,
    popup: false
  }),
  computed: {
    maxAdaptiveQuality() {
      let sortArray = this.adaptiveVideos
      return sortArray.reverse()[0]
    },
    minAdaptiveQuality() {
      let sortArray = this.adaptiveVideos
      return sortArray[0]
    },
    sortedAdaptiveQualities() {
      let sortArray = this.adaptiveVideos
      return sortArray.sort((a, b) => parseInt(a.bitrate) - parseInt(b.bitrate))
    },
    adaptiveVideos() {
      return this.adaptiveFormats.filter(value => value.type.match(/.*video.*/))
    },
    elementHeight() {
      if (this.$refs.qualityPopup) {
        return this.$refs.qualityPopup.clientHeight
      } else {
        return 0
      }
    }
  },
  methods: {
    onQualityInteraction() {
      this.popup = !this.popup
    },
    onQualityMouseup() {
    },
    onQualityTouchInteraction() {

    }
  }
}
</script>

<style lang="scss">
.quality {
  width: 40px;
  height: 40px;
  margin: 0;
  align-self: center;
  position: relative;
  $bottom-controls-height: $bottom-overlay-height - $video-seekbar-height;

  .quality-popup {
    position: absolute;
    top: -100%;
  }

  .material-design-icon {
    width: $bottom-controls-height;
    height: $bottom-controls-height;
    cursor: pointer;

    svg {
      height: 30px !important;
      width: 30px !important;
      margin: auto;
      bottom: 0 !important;
      position: initial !important;
    }
  }
}
</style>
