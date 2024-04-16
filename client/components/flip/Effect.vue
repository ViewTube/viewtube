<script setup lang="ts">
const props = defineProps<{
  name: string;
  duration: number;
  position: string;
}>();

const effectItemWidth = 100;

const leftPercentage = computed(() => {
  if (props.position === 'left') return `calc(25% - ${effectItemWidth / 2}px)`;
  if (props.position === 'right') return `calc(75% - ${effectItemWidth / 2}px)`;
  return `calc(50% - ${effectItemWidth / 2}px)`;
});

const iconName = computed(() => {
  if (props.name === 'skipForward') return 'mdi:skip-forward';
  if (props.name === 'skipBackward') return 'mdi:skip-backward';
  if (props.name === 'volumeUp') return 'mdi:volume-high';
  if (props.name === 'volumeDown') return 'mdi:volume-medium';
  if (props.name === 'toggleCaptions') return 'mdi:closed-caption-outline';
  return 'mdi:play';
});
</script>

<template>
  <div class="effect" :style="{ animationDuration: `${duration}ms`, left: leftPercentage }">
    <VTIcon :name="iconName" class="effect-icon" />
  </div>
</template>

<style lang="scss" scoped>
@keyframes effect-animation {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
.effect {
  position: absolute;
  height: 100px;
  width: 100px;
  background-color: #00000043;
  border-radius: 50%;
  top: calc(50% - 50px);
  animation-name: effect-animation;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  display: flex;

  .effect-icon {
    margin: auto;
    font-size: 2.5rem;
  }
}
</style>
