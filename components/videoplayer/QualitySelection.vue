<template>
  <div
    class="quality"
    @mouseup.stop="onQualityMouseup"
  >
    <SettingsIcon
      @click.stop="onQualityInteraction"
      @touchend.stop="onQualityTouchInteraction"
    />
    <transition name="circle-bottom">
      <div
        class="quality-popup"
        v-if="popup"
        ref="qualityPopup"
      >
        <div class="quality-submenu adaptive">
          <span class="quality-title">
            <MagicIcon />Automatic quality
          </span>
          <div
            class="qualities-info"
            :class="{ selected: selectedQuality === 0 }"
            @click.stop="setAutoQuality"
            @touchend.stop="onQualityTouchInteraction"
          >
            <p>Max: {{ maxAdaptiveQuality.qualityLabel }}</p>
            <p>Min: {{ minAdaptiveQuality.qualityLabel }}</p>
          </div>
        </div>
        <div class="quality-submenu">
          <span class="quality-title">
            <HighDefinitionIcon />Legacy format
          </span>
          <div
            class="format-quality-entry"
            v-for="(quality, id) in formatStreams"
            :key="id + 1"
            :class="{ selected: selectedQuality === id + 1 }"
            @click.stop="setFormatQuality(id + 1)"
            @touchend.stop="onQualityTouchInteraction"
          >{{ quality.qualityLabel }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import SettingsIcon from 'vue-material-design-icons/Cog'
import HighDefinitionIcon from 'vue-material-design-icons/HighDefinition'
import MagicIcon from 'vue-material-design-icons/AutoFix'

export default {
  name: 'quality-selection',
  components: {
    SettingsIcon,
    HighDefinitionIcon,
    MagicIcon
  },
  props: {
    formatStreams: Array,
    adaptiveFormats: Array
  },
  data: () => ({
    qualityUrl: null,
    selectedQuality: 1,
    popup: false,
    elementHeight: 0
  }),
  computed: {
    maxAdaptiveQuality() {
      return this.sortedAdaptiveQualities.slice().reverse()[0]
    },
    minAdaptiveQuality() {
      return this.sortedAdaptiveQualities[0]
    },
    sortedAdaptiveQualities() {
      return this.adaptiveVideos.slice().sort((a, b) => parseInt(a.bitrate) - parseInt(b.bitrate))
    },
    adaptiveVideos() {
      return this.adaptiveFormats.filter(value => {
        if (value.type) {
          return value.type.match(/.*video.*/)
        }
      })
    }
  },
  methods: {
    onQualityInteraction() {
      this.popup = !this.popup
    },
    onQualityMouseup() {
    },
    onQualityTouchInteraction() {

    },
    setFormatQuality() {

    },
    setAutoQuality() {

    }
  }
}
</script>

<style lang="scss">
.circle-bottom-enter-active,
.circle-bottom-leave-active {
  transition: clip-path 300ms $intro-easing, transform 300ms $intro-easing;
}
.circle-bottom-enter-to,
.circle-bottom-leave {
  clip-path: circle(200% at 95% 95%);
  transform: translateY(0);
}
.circle-bottom-enter,
.circle-bottom-leave-to {
  clip-path: circle(0 at 95% 95%);
  transform: translateY(20px);
}

.quality {
  width: 40px;
  height: 40px;
  margin: 0;
  align-self: center;
  position: relative;
  $bottom-controls-height: $bottom-overlay-height - $video-seekbar-height;

  .quality-popup {
    position: absolute;
    top: -240px;
    right: 0;
    display: flex;
    flex-direction: column;
    width: unset;
    overflow-y: auto;
    max-height: 220px;
    background-color: var(--bgcolor-alt);
    box-sizing: border-box;
    border-radius: 3px;
    box-shadow: $max-shadow;
    padding: 10px 0;

    .quality-submenu {
      width: 240px;
      border-radius: 0;
      margin: 0;
      padding: 0 0 0 0;
      display: flex;
      flex-direction: column;
      position: relative;
      box-sizing: border-box;

      .quality-title {
        margin: 0 0 0 50px;
        box-sizing: border-box;
        color: var(--theme-color);
      }

      .qualities-info {
        display: flex;
        flex-direction: row;
        font-size: 0.9rem;
        margin: 6px 10px 6px 40px;
        padding: 6px 0 6px 10px;
        border-radius: 3px;
        box-sizing: border-box;
        cursor: pointer;

        &:hover,
        &:active,
        &:focus {
          background-color: var(--bgcolor-alt-light) !important;
        }

        &.selected {
          background-color: var(--theme-color-translucent);
        }

        p {
          margin: 0 2px;
        }
      }

      .format-quality-entry {
        margin: 3px 10px 3px 40px;
        padding: 6px 0 6px 10px;
        cursor: pointer;
        border-radius: 3px;
        font-size: 0.9rem;
        box-sizing: border-box;

        &:nth-of-type(1) {
          margin-top: 6px;
        }

        &:hover:not(.selected),
        &:active,
        &:focus {
          background-color: var(--bgcolor-alt-light) !important;
        }

        &.selected {
          background-color: var(--theme-color-translucent);
        }
      }

      .material-design-icon {
        left: 4px;
        top: -6px;
        position: absolute;
        transform: scale(0.8);
      }
    }
  }

  .material-design-icon {
    width: $bottom-controls-height;
    height: $bottom-controls-height;
    cursor: pointer;

    svg {
      height: 30px;
      width: 30px;
      margin: auto;
      bottom: 0 !important;
      position: initial !important;
    }
  }
}
</style>
