<template>
  <div
    class="volume-control"
    @mouseup.stop="onVolumeInteraction"
    @click.stop="onVolumeInteraction"
    @touchend.stop="onVolumeInteraction"
  >
    <VolumeHighIcon
      v-if="volumeCategory == 3"
      @click.stop="popupVisible = !popupVisible"
      @touchend.stop="onVolumeTouchInteraction"
    />
    <VolumeMediumIcon
      v-if="volumeCategory == 2"
      @click.stop="popupVisible = !popupVisible"
      @touchend.stop="onVolumeTouchInteraction"
    />
    <VolumeLowIcon
      v-if="volumeCategory == 1"
      @click.stop="popupVisible = !popupVisible"
      @touchend.stop="onVolumeTouchInteraction"
    />
    <VolumeOffIcon
      v-if="volumeCategory == 0"
      @click.stop="popupVisible = !popupVisible"
      @touchend.stop="onVolumeTouchInteraction"
    />
    <div class="volume-control-popup" :class="{ hidden: !popupVisible }">
      <input
        type="range"
        name="volume"
        min="0"
        max="1"
        step="0.1"
        id="volume"
        :value="value"
        v-on:input="$emit('input', $event.target.value)"
      />
      <span class="slider-progress" :style="{ width: `${value * 100}%` }"></span>
      <span class="slider-background"></span>
    </div>
  </div>
</template>

<script>
import VolumeHighIcon from 'icons/VolumeHigh'
import VolumeMediumIcon from 'icons/VolumeMedium'
import VolumeLowIcon from 'icons/VolumeLow'
import VolumeOffIcon from 'icons/VolumeOff'

export default {
  name: 'volume-control',
  components: {
    VolumeHighIcon,
    VolumeMediumIcon,
    VolumeLowIcon,
    VolumeOffIcon
  },
  props: {
    value: null
  },
  data: function () {
    return {
      popupVisible: false
    }
  },
  computed: {
    volumeCategory () {
      if (this.value >= 1) {
        return 3
      } else if (this.value < 1 && this.value >= 0.5) {
        return 2
      } else if (this.value < 0.5 && this.value > 0) {
        return 1
      } else if (this.value <= 0) {
        return 0
      }
      return 0
    }
  },
  methods: {
    onVolumeInteraction: function (e) {
      e.preventDefault()
      e.stopPropagation()
    },
    onVolumeTouchInteraction: function (e) {
      this.popupVisible = !this.popupVisible
      e.preventDefault()
      e.stopPropagation()
    }
  }
}
</script>

<style lang="scss" scoped>
.volume-control {
  position: relative;
  display: flex;
  flex-direction: row;

  .volume-control-popup {
    position: relative;
    height: 100%;
    width: 80px;
    transition: width 200ms $intro-easing, opacity 200ms $intro-easing;

    &.hidden {
      opacity: 0;
      pointer-events: none;
      width: 0;
    }

    #volume {
      all: unset;

      -webkit-appearance: none;
      appearance: none;

      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0;
      width: 100%;
      height: 15px;
      transform-origin: left;
      cursor: pointer;

      @mixin slider-thumb {
        all: unset;

        -webkit-appearance: none;
        appearance: none;

        background: $theme-color;
        height: $video-seekbar-line-height;
        border-radius: 50%;
        width: 15px;
        height: 15px;
        transform: translateX(5%) scale(0);
        transition: transform 100ms linear;
      }

      &::-webkit-slider-thumb {
        @include slider-thumb;
      }

      &::-moz-range-thumb {
        @include slider-thumb;
      }
    }

    .slider-progress,
    .slider-background {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0;
      height: 3px;
      transition: height 100ms linear;
      pointer-events: none;
    }

    .slider-progress {
      background-color: $theme-color;
    }

    .slider-background {
      background-color: $line-color;
      width: 100%;
    }

    &:hover {
      #volume {
        &::-moz-range-thumb {
          transform: translateX(5%) scale(1);
        }
      }
      .slider-background,
      .slider-progress {
        height: 7px;
      }
    }
  }
}
</style>
