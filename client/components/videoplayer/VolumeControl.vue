<template>
  <div
    class="volume-control"
    :class="{ visible }"
    @mouseup.stop="stopEvent"
    @click.stop="stopEvent"
    @touchend.stop="onTouch"
  >
    <VolumeHighIcon v-if="volumeCategory == 3" />
    <VolumeMediumIcon v-if="volumeCategory == 2" />
    <VolumeLowIcon v-if="volumeCategory == 1" />
    <VolumeOffIcon v-if="volumeCategory == 0" />
    <div class="volume-control-popup">
      <input
        id="volume"
        type="range"
        name="volume"
        min="0"
        max="1"
        step="0.05"
        :value="value"
        @input="$emit('input', $event.target.value)"
      />
      <span class="slider-progress" :style="{ width: `${value * 100}%` }" />
      <span class="slider-background" />
    </div>
    <div class="volume-percentage">
      <span class="percentage">{{ Math.floor(value * 100) }}%</span>
    </div>
  </div>
</template>

<script lang="ts">
import VolumeHighIcon from 'vue-material-design-icons/VolumeHigh.vue';
import VolumeMediumIcon from 'vue-material-design-icons/VolumeMedium.vue';
import VolumeLowIcon from 'vue-material-design-icons/VolumeLow.vue';
import VolumeOffIcon from 'vue-material-design-icons/VolumeOff.vue';
import { computed, defineComponent, ref } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'VolumeControl',
  components: {
    VolumeHighIcon,
    VolumeMediumIcon,
    VolumeLowIcon,
    VolumeOffIcon
  },
  props: {
    value: null
  },
  setup(props) {
    const visible = ref(false);

    const volumeCategory = computed((): number => {
      if (props.value >= 1) {
        return 3;
      } else if (props.value < 1 && props.value >= 0.5) {
        return 2;
      } else if (props.value < 0.5 && props.value > 0) {
        return 1;
      } else if (props.value <= 0) {
        return 0;
      }
      return 0;
    });

    const stopEvent = () => {};

    const onTouch = () => {
      visible.value = true;
      setTimeout(() => {
        visible.value = false;
      }, 1000);
    };

    return {
      visible,
      volumeCategory,
      stopEvent,
      onTouch
    };
  }
});
</script>

<style lang="scss" scoped>
.volume-control {
  position: relative;
  display: flex;
  flex-direction: row;
  padding: 0 10px 0 0;
  border-radius: 5px;
  background-color: var(--bgcolor-alt);

  &:hover,
  &.visible {
    .volume-percentage {
      margin: auto 0 auto 10px;
    }

    .volume-control-popup {
      width: 120px;
      opacity: 1;
      pointer-events: auto;
    }
  }

  .volume-percentage {
    height: 80%;
    transition: margin 200ms $intro-easing;
    overflow: hidden;
    display: flex;
    pointer-events: none;
    margin: auto 0;

    .percentage {
      font-size: 1.1rem;
      margin: auto;
    }
  }

  .volume-control-popup {
    position: relative;
    height: 100%;

    transition: width 200ms $intro-easing, opacity 200ms $intro-easing;

    opacity: 0;
    pointer-events: none;
    width: 0;

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

        background: var(--theme-color);
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
      background-color: var(--theme-color);
    }

    .slider-background {
      background-color: var(--line-color);
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
