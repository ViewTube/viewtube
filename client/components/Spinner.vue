<template>
  <div class="spinner">
    <div class="rect rect1" />
    <div class="rect rect2" />
    <div class="rect rect3" />
    <div class="rect rect4" />
    <div class="rect rect5" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'Spinner'
});
</script>

<style lang="scss">
.spinner {
  margin: auto;
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 10px;
  $rectangle-width: 8px;
  user-select: none;
  display: flex;
  flex-direction: row;

  .rect {
    background-image: var(--theme-color-gradient);
    background-size: $rectangle-width * 5;
    background-position: 0;
    height: 100%;
    width: $rectangle-width;
    display: block;
    animation: spinner 2s infinite $dynamic-easing;
    animation-delay: -1.2s;
    margin: 0 1px;
  }

  .rect2 {
    animation-delay: -1.1s;
    background-position: -$rectangle-width;
  }

  .rect3 {
    animation-delay: -1s;
    background-position: -$rectangle-width * 2;
  }

  .rect4 {
    animation-delay: -0.9s;
    background-position: -$rectangle-width * 3;
  }

  .rect5 {
    animation-delay: -0.8s;
    background-position: -$rectangle-width * 4;
  }

  &.invisible {
    display: none;
  }
}

@keyframes spinner {
  0%,
  40%,
  100% {
    transform: scale(1, 0.4);
  }
  20% {
    transform: scale(1, 1);
  }
}
</style>
