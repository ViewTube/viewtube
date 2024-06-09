<template>
  <a
    v-ripple
    href="#"
    :class="{ visible: visible, 'animating-out': animatingOut }"
    class="skip-btn"
    @click.stop="clickFunction"
    @touchstart.stop="clickFunction"
  >
    <div class="content">Skip {{ category }}</div>
  </a>
</template>

<script lang="ts">
export default defineComponent({
  name: 'SkipButton',
  props: {
    clickFn: Function,
    visible: Boolean,
    category: String
  },
  setup(props) {
    const animatingOut = ref(false);

    const clickFunction = (e: Event): void => {
      if (props.clickFn instanceof Function) {
        e.preventDefault();
        props.clickFn();
        animatingOut.value = true;
        setTimeout(() => {
          animatingOut.value = false;
        }, 1000);
      }
    };

    return {
      animatingOut,
      clickFunction
    };
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
  transition:
    background-color 200ms $intro-easing,
    border 200ms $intro-easing,
    transform 200ms $intro-easing,
    opacity 200ms $intro-easing;
  border: 2px solid var(--theme-color-translucent);
  white-space: nowrap;
  position: absolute !important;
  right: 30px;
  bottom: 50%;
  transform: translate(20px, 50%);
  pointer-events: none;
  opacity: 0;
  background-color: #000000bb;

  &.visible {
    pointer-events: all;
    opacity: 1;
    transform: translate(0, 50%);
  }

  &.animating-out {
    transform: translate(20px, 50%);
    pointer-events: none;
    opacity: 0;
  }

  .content {
    display: flex;
    flex-direction: row;
    padding: 6px 10px;
    position: relative;
  }
}
</style>
