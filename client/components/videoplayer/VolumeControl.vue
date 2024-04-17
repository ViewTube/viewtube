<script setup lang="ts">
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>();

const props = defineProps<{
  modelValue: number;
  playerOverlayVisible: boolean;
}>();

const expanded = ref(false);

const volumeCategory = computed((): number => {
  if (props.modelValue >= 1) {
    return 3;
  } else if (props.modelValue < 1 && props.modelValue >= 0.5) {
    return 2;
  } else if (props.modelValue < 0.5 && props.modelValue > 0) {
    return 1;
  } else if (props.modelValue <= 0) {
    return 0;
  }
  return 0;
});

const onTouch = () => {
  if (props.playerOverlayVisible) {
    expanded.value = true;
    setTimeout(() => {
      expanded.value = false;
    }, 1000);
  }
};

const volumeValue = computed({
  get: () => props.modelValue,
  set: value => {
    if (!preventReset.value) {
      emit('update:modelValue', value);
    }
  }
});

const preventReset = ref(false);

const onMouseUp = () => {
  preventReset.value = true;
};

const onMouseDown = () => {
  preventReset.value = false;
};
</script>

<template>
  <div
    class="volume-control"
    :class="{ expanded }"
    @mouseup.stop
    @click.stop
    @touchend.stop="onTouch"
  >
    <VTIcon v-if="volumeCategory == 3" name="mdi:volume-high" />
    <VTIcon v-if="volumeCategory == 2" name="mdi:volume-medium" />
    <VTIcon v-if="volumeCategory == 1" name="mdi:volume-low" />
    <VTIcon v-if="volumeCategory == 0" name="mdi:volume-off" />
    <div class="volume-control-popup">
      <input
        id="volume"
        v-model="volumeValue"
        type="range"
        name="volume"
        min="0"
        max="1"
        step="0.05"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
      />
      <span class="slider-progress" />
      <span class="slider-background" />
      <span class="slider-thumb" />
    </div>
    <div class="volume-percentage">
      <span class="percentage">{{ Math.floor(volumeValue * 100) }}%</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.volume-control {
  position: relative;
  display: flex;
  flex-direction: row;
  padding: 0 10px 0 0;
  border-radius: 5px;
  background-color: var(--bgcolor-alt);

  &:hover,
  &.expanded {
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

    transition:
      width 200ms $intro-easing,
      opacity 200ms $intro-easing;

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

      &::-webkit-slider-thumb {
        visibility: hidden;
      }

      &::-moz-range-thumb {
        height: 0;
        width: 0;
        border: 0;
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
      width: v-bind('`${volumeValue * 100}%`');
    }

    .slider-thumb {
      display: block;
      background: var(--theme-color);
      border-radius: 50%;
      width: 0;
      height: 0;
      top: 50%;
      transform: translate(-50%, -50%);
      left: v-bind('`${volumeValue * 100}%`');
      transition:
        height 100ms linear,
        width 100ms linear;
      position: absolute;
      pointer-events: none;
    }

    .slider-background {
      background-color: var(--line-color);
      width: 100%;
    }

    &:hover {
      .slider-thumb {
        width: 15px;
        height: 15px;
      }
      .slider-background,
      .slider-progress {
        height: 7px;
      }
    }
  }
}
</style>
