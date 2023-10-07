<script setup lang="ts">
const props = defineProps<{
  duration: number;
  currentTime: number;
  bufferLevel: number;
}>();

const bufferWidth = computed(
  () => `${((props.currentTime + props.bufferLevel) / props.duration) * 100}%`
);

const currentTimeWidth = computed(() => `${(props.currentTime / props.duration) * 100}%`);
</script>

<template>
  <div class="flip-seekbar-container">
    <div class="flip-seekbar">
      <div class="flip-seekbar-buffer seekbar-overlay" />
      <div class="flip-seekbar-progress seekbar-overlay" />
      <div class="flip-seekbar-point" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flip-seekbar-container {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  pointer-events: auto;
  cursor: pointer;

  .flip-seekbar {
    width: calc(100% - 20px);
    margin: auto;
    background-color: var(--line-color);
    height: 4px;
    border-radius: 25px;
    position: relative;

    .seekbar-overlay {
      position: absolute;
      top: 0;
      bottom: 0;
      height: 100%;
    }

    .flip-seekbar-buffer {
      background-color: var(--line-accent-color);
      width: v-bind(bufferWidth);
    }

    .flip-seekbar-progress {
      background-color: var(--theme-color);
      width: v-bind(currentTimeWidth);
    }

    .flip-seekbar-point {
      left: calc(v-bind(currentTimeWidth) - 6px);
      top: -4px;
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--theme-color);
      transform: scale(0);
      transition: transform 300ms $intro-easing;
    }
  }

  &:hover {
    .flip-seekbar-point {
      transform: scale(1);
    }
  }
}
</style>
