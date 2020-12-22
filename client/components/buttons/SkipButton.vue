<template>
  <a v-ripple href="#" :class="{ visible }" class="skip-btn" @click.stop="clickFunction">
    <div class="content">Skip {{ category }}</div>
  </a>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SkipButton',
  props: {
    clickFn: Function,
    visible: Boolean,
    category: String
  },
  methods: {
    clickFunction(e: Event): void {
      if (this.clickFn instanceof Function) {
        e.preventDefault();
        this.clickFn();
      }
    }
  }
});
</script>

<style lang="scss">
.skip-btn {
  text-decoration: none;
  color: var(--title-color);
  margin: 2px 5px 2px 0;
  border-radius: 3px;
  display: inline-block;
  transition: background-color 200ms $intro-easing, border 200ms $intro-easing;
  border: 2px solid var(--theme-color-translucent);
  white-space: nowrap;
  position: absolute !important;
  right: 30px;
  bottom: 50%;
  transform: translateY(50%);
  pointer-events: none;
  opacity: 0;

  &.visible {
    pointer-events: all;
    opacity: 1;
  }

  .content {
    display: flex;
    flex-direction: row;
    padding: 2px 4px;
    position: relative;
  }
}
</style>
