<template>
  <div class="video-player-settings" @mouseup.stop="onQualityMouseup">
    <SettingsIcon @click.stop="onQualityInteraction" @touchend.stop="onQualityTouchInteraction" />
    <portal to="popup">
      <transition name="player-settings-popup">
        <div
          v-if="popup"
          class="player-settings-popup-overlay"
          @click.stop="popup = false"
          @touchend.stop="popup = false"
        >
          <div
            class="player-settings-popup"
            @click.stop="onQualityMouseup"
            @touchend.stop="onQualityMouseup"
          >
            <div v-if="adaptiveFormats" class="player-settings-submenu adaptive">
              <span class="player-settings-title"> <MagicIcon />Automatic quality </span>
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
            <div class="player-settings-submenu">
              <span class="player-settings-title"><HighDefinitionIcon />Video Quality</span>
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
            <div class="player-settings-submenu">
              <span class="player-settings-title"><SettingsIcon />Other settings</span>
              <SwitchButton
                :value="loopVideo"
                :label="'Loop'"
                :disabled="false"
                :right="true"
                @valuechange="val => (loopVideo = val)"
              />
              <div class="settings-number-menu">
                <label for="video-speed-input">Speed</label>
                <input
                  id="video-speed-input"
                  class="settings-number-input"
                  type="number"
                  name="video-speed"
                  :value="videoSpeed"
                  step="0.1"
                  max="3"
                  min="0.1"
                  @keydown.stop="() => {}"
                  @change="changeVideoSpeed"
                />
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
import SwitchButton from '@/components/buttons/SwitchButton.vue';
import { computed, defineComponent, onMounted, ref, watch } from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';

export default defineComponent({
  name: 'QualitySelection',
  components: {
    SettingsIcon,
    HighDefinitionIcon,
    MagicIcon,
    SwitchButton
  },
  props: {
    selectedQuality: Number,
    formatStreams: Array,
    adaptiveFormats: { type: Array, required: false, default: null }
  },
  setup(props, { emit }) {
    const accessor = useAccessor();
    const qualityUrl = ref(null);
    const popup = ref(false);
    const elementHeight = ref(0);

    const loopVideo = ref(false);
    const videoSpeed = ref(1);

    const changeVideoSpeed = (e: any) => {
      let speed = e.target.value;
      if (e.target.value < 0.1) {
        speed = 0.1;
      }
      if (e.target.value > 3) {
        speed = 3;
      }
      videoSpeed.value = speed;
    };

    watch(loopVideo, newVal => {
      accessor.videoPlayer.setLoop(newVal);
      emit('loopchange', newVal);
    });

    watch(videoSpeed, newVal => {
      emit('speedchange', newVal);
    });

    onMounted(() => {
      loopVideo.value = accessor.settings.alwaysLoopVideo;
      videoSpeed.value = accessor.settings.defaultVideoSpeed;
    });

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
      changeVideoSpeed,
      onQualityInteraction,
      onQualityMouseup,
      onQualityTouchInteraction,
      setFormatQuality,
      setAutoQuality,
      loopVideo,
      videoSpeed
    };
  }
});
</script>

<style lang="scss">
.player-settings-popup-enter-active,
.player-settings-popup-leave-active {
  .player-settings-popup {
    transition: transform 300ms $intro-easing;
  }
  transition: opacity 280ms $intro-easing;
}
.player-settings-popup-enter-to,
.player-settings-popup-leave {
  .player-settings-popup {
    transform: scale(1);
  }
  opacity: 1;
}
.player-settings-popup-enter,
.player-settings-popup-leave-to {
  .player-settings-popup {
    transform: scale(1.1);
  }
  opacity: 0;
}
$bottom-controls-height: $bottom-overlay-height - $video-seekbar-height;

.video-player-settings {
  width: 40px;
  height: 40px;
  margin: 0;
  align-self: center;
  position: relative;
}

.player-settings-popup-overlay {
  position: absolute;
  background-color: #00000063;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 141;
  display: grid;

  .player-settings-popup {
    margin: auto;
    display: flex;
    flex-direction: column;
    width: unset;
    overflow-y: auto;
    max-height: 250px;
    background-color: var(--bgcolor-alt);
    box-sizing: border-box;
    border-radius: 3px;
    box-shadow: $max-shadow;
    padding: 10px 0;

    .player-settings-submenu {
      width: 300px;
      border-radius: 0;
      margin: 0;
      padding: 0 0 0 0;
      display: flex;
      flex-direction: column;
      position: relative;
      box-sizing: border-box;

      .switch {
        font-size: 0.9rem;
        margin: 10px 0 0 40px !important;
        width: calc(100% - 50px);

        .switch-container {
          transform: scale(0.9);
        }
      }

      .settings-number-menu {
        display: flex;
        flex-direction: row;
        width: calc(100% - 50px);
        justify-content: space-between;
        margin: 10px 0 0 40px !important;
        font-size: 0.9rem;

        .settings-number-input {
          all: unset;
          border: 2px solid var(--bgcolor-alt-light);
          width: 50px;
          padding: 2px 5px;
          border-radius: 5px;
          transition: border 300ms $intro-easing;

          &:focus {
            border: 2px solid var(--theme-color);
          }
        }
      }

      .player-settings-title {
        margin: 0 0 0 40px;
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

        &:first-of-type {
          margin-top: 6px;
        }

        &:last-of-type {
          margin-bottom: 12px;
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
