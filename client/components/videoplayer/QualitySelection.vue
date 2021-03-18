<template>
  <div class="quality" @mouseup.stop="onQualityMouseup">
    <SettingsIcon @click.stop="onQualityInteraction" @touchend.stop="onQualityTouchInteraction" />
    <portal to="video-player">
      <transition name="quality-popup">
        <div
          v-if="popup"
          class="quality-popup-overlay"
          @click.stop="popup = false"
          @touchend.stop="popup = false"
        >
          <div ref="qualityPopup" class="quality-popup">
            <div v-if="adaptiveFormats" class="quality-submenu adaptive">
              <span class="quality-title"> <MagicIcon />Automatic quality </span>
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
              <span class="quality-title"> <HighDefinitionIcon />Video Quality</span>
              <div
                v-for="(quality, id) in formatQualities"
                :key="id"
                class="format-quality-entry"
                :class="{
                  selected: selectedQuality === id
                }"
                @click.stop="setFormatQuality(id)"
                @touchend.stop="onQualityTouchInteraction"
              >
                {{ quality.qualityLabel }}
              </div>
            </div>
          </div>
        </div>
      </transition>
    </portal>
  </div>
</template>

<script lang="ts">
import SettingsIcon from 'vue-material-design-icons/Cog.vue';
import HighDefinitionIcon from 'vue-material-design-icons/HighDefinition.vue';
import MagicIcon from 'vue-material-design-icons/AutoFix.vue';
import { computed, defineComponent, ref } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'QualitySelection',
  components: {
    SettingsIcon,
    HighDefinitionIcon,
    MagicIcon
  },
  props: {
    selectedQuality: Number,
    formatStreams: Array,
    adaptiveFormats: { type: Array, required: false, default: null }
  },
  setup(props, { emit }) {
    const qualityUrl = ref(null);
    const popup = ref(false);
    const elementHeight = ref(0);

    const maxAdaptiveQuality = computed((): any => {
      return sortedAdaptiveQualities.value.slice().reverse()[0];
    });
    const minAdaptiveQuality = computed((): any => {
      return sortedAdaptiveQualities[0];
    });
    const formatQualities = computed((): any => {
      return props.formatStreams.filter((el: any) => el.qualityLabel);
    });
    const sortedAdaptiveQualities = computed((): any => {
      return adaptiveVideos.value
        .slice()
        .sort(
          (a: { bitrate: string }, b: { bitrate: string }) =>
            parseInt(a.bitrate) - parseInt(b.bitrate)
        );
    });
    const adaptiveVideos = computed((): any => {
      return props.adaptiveFormats.filter((value: any) => {
        if (value.type) {
          return value.type.match(/.*video.*/);
        }
        return false;
      });
    });

    const onQualityInteraction = () => {
      popup.value = !popup.value;
    };

    const onQualityMouseup = () => {};
    const onQualityTouchInteraction = () => {};
    const setFormatQuality = (nr: number) => {
      emit('qualityselect', nr);
    };
    const setAutoQuality = () => {};

    return {
      qualityUrl,
      popup,
      elementHeight,
      maxAdaptiveQuality,
      minAdaptiveQuality,
      formatQualities,
      sortedAdaptiveQualities,
      adaptiveVideos,
      onQualityInteraction,
      onQualityMouseup,
      onQualityTouchInteraction,
      setFormatQuality,
      setAutoQuality
    };
  }
});
</script>

<style lang="scss">
.quality-popup-enter-active,
.quality-popup-leave-active {
  .quality-popup {
    transition: transform 300ms $intro-easing;
  }
  transition: opacity 280ms $intro-easing;
}
.quality-popup-enter-to,
.quality-popup-leave {
  .quality-popup {
    transform: scale(1);
  }
  opacity: 1;
}
.quality-popup-enter,
.quality-popup-leave-to {
  .quality-popup {
    transform: scale(1.1);
  }
  opacity: 0;
}
$bottom-controls-height: $bottom-overlay-height - $video-seekbar-height;

.quality {
  width: 40px;
  height: 40px;
  margin: 0;
  align-self: center;
  position: relative;
}

.quality-popup-overlay {
  position: absolute;
  background-color: #00000063;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 141;
  display: grid;

  .quality-popup {
    margin: auto;
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
