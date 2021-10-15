<template>
  <div class="video-player-settings" @mouseup.stop="onQualityMouseup">
    <div class="quality-icon">
      <span class="quality-label-small">{{ smallQualityLabel }}</span>
      <SettingsIcon @click.stop="onQualityInteraction" @touchend.stop="onQualityTouchInteraction" />
    </div>
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
            <div v-if="videoQualityList" class="player-settings-submenu">
              <span class="player-settings-title"><HighDefinitionIcon />Video Quality</span>
              <SwitchButton
                :value="$accessor.settings.autoAdjustVideoQuality"
                :label="'Automatically adjust'"
                :disabled="false"
                :right="true"
                @valuechange="autoAdjustVideoQuality"
              />
              <div
                v-for="(quality, index) in videoQualityList"
                :key="quality.qualityIndex ? quality.qualityIndex : index"
                class="format-quality-entry"
                :class="{
                  selected:
                    quality.qualityIndex === selectedVideoQuality || index === selectedVideoQuality
                }"
                @click.stop="setVideoQuality(quality.qualityIndex ? quality.qualityIndex : index)"
                @touchend.stop="onQualityTouchInteraction"
              >
                {{
                  quality.width && quality.height
                    ? `${quality.width}x${quality.height} - `
                    : `${quality.qualityLabel} - `
                }}
                {{ $formatting.humanizeFileSize(quality.bitrate, true) }}/s
                <span
                  v-if="recommendedResolution && quality.qualityIndex === recommendedResolution"
                  v-tippy="'Recommended for your screen size'"
                  class="recommended-icon"
                  ><CheckIcon
                /></span>
              </div>
            </div>
            <div v-if="audioQualityList" class="player-settings-submenu">
              <span class="player-settings-title"><AudioDefinitionIcon />Audio Quality</span>
              <SwitchButton
                :value="$accessor.settings.autoAdjustAudioQuality"
                :label="'Automatically adjust'"
                :disabled="false"
                :right="true"
                @valuechange="autoAdjustAudioQuality"
              />
              <div
                v-for="quality in audioQualityList"
                :key="quality.qualityIndex"
                class="format-quality-entry"
                :class="{
                  selected: quality.qualityIndex === selectedAudioQuality
                }"
                @click.stop="setAudioQuality(quality.qualityIndex)"
                @touchend.stop="onQualityTouchInteraction"
              >
                {{ $formatting.humanizeFileSize(quality.bitrate, true) }}/s
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
import AudioDefinitionIcon from 'vue-material-design-icons/QualityHigh.vue';
import CheckIcon from 'vue-material-design-icons/Check.vue';
// import MagicIcon from 'vue-material-design-icons/AutoFix.vue';
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from '@nuxtjs/composition-api';
import SwitchButton from '@/components/buttons/SwitchButton.vue';
import { useAccessor } from '@/store';
import { createComputed } from '@/plugins/computed';

export default defineComponent({
  name: 'QualitySelection',
  components: {
    SettingsIcon,
    HighDefinitionIcon,
    AudioDefinitionIcon,
    CheckIcon,
    // MagicIcon,
    SwitchButton
  },
  props: {
    selectedVideoQuality: Number,
    selectedAudioQuality: Number,
    renderedVideoQuality: Number,
    videoQualityList: Array,
    audioQualityList: Array
  },
  setup(props, { emit }) {
    const accessor = useAccessor();
    const qualityUrl = ref(null);
    const popup = ref(false);
    const elementHeight = ref(0);

    const loopVideo = ref(false);
    const videoSpeed = ref(1);

    const recommendedResolution = ref(null);

    const smallQualityLabel = createComputed(() => {
      if (props.videoQualityList && props.renderedVideoQuality) {
        const renderedQuality: any = props.videoQualityList[props.renderedVideoQuality];
        return `${renderedQuality.width}x${renderedQuality.height}`;
      }
    });

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

    const refreshRecommended = () => {
      if (process.browser && props.videoQualityList) {
        const sortedResArray: Array<any> = [...props.videoQualityList].sort((a: any, b: any) => {
          const screenHeight = screen.height * window.devicePixelRatio;
          const aDiff = Math.abs(a.height - screenHeight);
          const bDiff = Math.abs(b.height - screenHeight);
          return aDiff - bDiff;
        });
        recommendedResolution.value = sortedResArray[0].qualityIndex;
        emit('refreshrecommended', recommendedResolution.value);
      }
    };

    const autoAdjustVideoQuality = (val: boolean) => {
      accessor.settings.setAutoAdjustVideoQuality(val);
      emit('autoadjustchange');
    };

    const autoAdjustAudioQuality = (val: boolean) => {
      accessor.settings.setAutoAdjustAudioQuality(val);
      emit('autoadjustchange');
    };

    onMounted(() => {
      loopVideo.value = accessor.settings.alwaysLoopVideo;
      videoSpeed.value = accessor.settings.defaultVideoSpeed;

      window.addEventListener('resize', refreshRecommended);
    });

    const onQualityInteraction = () => {
      refreshRecommended();
      popup.value = !popup.value;
    };

    const onQualityMouseup = () => {};
    const onQualityTouchInteraction = () => {};
    const setVideoQuality = (index: number) => {
      emit('videoqualityselect', index);
    };
    const setAudioQuality = (index: number) => {
      emit('audioqualityselect', index);
    };

    onBeforeUnmount(() => {
      window.removeEventListener('resize', refreshRecommended);
    });

    return {
      qualityUrl,
      popup,
      elementHeight,
      changeVideoSpeed,
      recommendedResolution,
      smallQualityLabel,
      onQualityInteraction,
      onQualityMouseup,
      onQualityTouchInteraction,
      setVideoQuality,
      setAudioQuality,
      autoAdjustVideoQuality,
      autoAdjustAudioQuality,
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
  height: 40px;
  margin: 0;
  align-self: center;
  position: relative;
}

.quality-icon {
  display: flex;
  flex-direction: row;

  .quality-label-small {
    margin: auto;
  }
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
    overflow: hidden auto;
    max-height: 100vh;
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
        position: relative;

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

        .recommended-icon {
          position: absolute;
          right: 40px;
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
