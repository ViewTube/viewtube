<template>
  <div
    ref="interactElement"
    class="message-box"
    :class="{
      'dismissed-right': dismissedRight,
      'dismissed-left': dismissedLeft,
      'is-animating': isInteractAnimating
    }"
    :style="{
      transform: transformString,
      opacity: swipeOpacity,
      cursor: message.clickAction ? 'pointer' : 'auto'
    }"
    @click="onMessageClick"
  >
    <span
      class="progress-line"
      :class="{ persist: !dismissTimeout }"
      :style="{ 'animation-duration': `${message.dismissDelay}ms` }"
    />
    <div
      v-ripple
      class="close"
      :style="{
        transition: `transform ${dismissTimeout}ms linear`
      }"
      @click="dismissMessage"
    >
      <CloseIcon />
    </div>
    <h3 class="title" :class="message.type">
      {{ message.title }}
    </h3>
    <p class="message" v-html="message.message" />
  </div>
</template>

<script lang="ts">
import CloseIcon from 'vue-material-design-icons/Close.vue';
// import Interact from 'interactjs'

import Vue from 'vue';

export default Vue.extend({
  name: 'MessageBox',
  components: {
    CloseIcon
  },
  props: {
    message: {
      type: Object
    }
  },
  data: () => ({
    dismissedRight: false,
    dismissedLeft: false,
    dismissTimeout: null,
    isInteractAnimating: true,
    interactPosition: {
      x: 0,
      y: 0
    },
    interactXThreshold: 100,
    swipeOpacity: 1
  }),
  computed: {
    transformString(): string | void {
      if (!this.isInteractAnimating) {
        const { x, y } = this.interactPosition;
        return `translate3D(${x}px, ${y}px, 0)`;
      }
      return null;
    }
  },
  mounted() {
    if (this.message.dismissDelay > 0) {
      this.dismissTimeout = setTimeout(this.dismissMessage, this.message.dismissDelay);
    }
    // const element = this.$refs.interactElement
    // Interact(element).draggable({
    //   onstart: () => {
    //     this.isInteractAnimating = false
    //   },
    //   onmove: e => {
    //     const x = this.interactPosition.x + e.dx
    //     const opacity = 1 - Math.abs(this.interactPosition.x / 300)
    //     this.interactSetPosition({ x }, opacity)
    //   },
    //   onend: () => {
    //     const x = this.interactPosition.x
    //     const iXThr = this.interactXThreshold
    //     this.isInteractAnimating = true

    //     if (x > iXThr) {
    //       this.dismissMessage()
    //     } else if (x < -iXThr) {
    //       this.dismissMessageLeft()
    //     } else {
    //       this.resetCardPosition()
    //     }
    //   }
    // })
  },
  methods: {
    dismissMessage() {
      this.dismissedRight = true;
      this.swipeOpacity = 0;
      setTimeout(() => this.message.dismiss(), 600);
    },
    dismissMessageLeft() {
      this.dismissedLeft = true;
      this.swipeOpacity = 0;
      setTimeout(() => this.message.dismiss(), 600);
    },
    onMessageClick() {
      if (this.dismissTimeout) {
        clearTimeout(this.dismissTimeout);
        this.dismissTimeout = null;
      }
      if (this.message.clickAction) {
        this.message.clickAction();
        this.dismissMessage();
      }
    },
    interactSetPosition(coordinates, distance) {
      const { x = 0, y = 0 } = coordinates;
      this.interactPosition = { x, y };
      this.swipeOpacity = distance;
    },
    resetCardPosition() {
      this.interactSetPosition({ x: 0, y: 0 }, 1);
    }
  }
});
</script>

<style lang="scss" scoped>
.message-box {
  width: 400px;
  background-color: var(--bgcolor-alt);
  margin: 10px;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  border-radius: 3px;
  box-shadow: $max-shadow;
  animation: blob-in-notif 300ms $intro-easing;
  overflow: hidden;

  &.is-animating {
    transition: transform 300ms, opacity 600ms;
  }

  &.dismissed-right {
    transition: transform 300ms, font-size 300ms 300ms, margin 300ms 300ms, padding 300ms 300ms,
      opacity 300ms !important;
    transition-timing-function: $dynamic-easing;
    transform: translateX(140%);
    margin: 0;
    padding: 0;
    font-size: 0;
  }

  &.dismissed-left {
    transition: transform 300ms, font-size 300ms 300ms, margin 300ms 300ms, padding 300ms 300ms,
      opacity 300ms !important;
    transition-timing-function: $dynamic-easing;
    transform: translateX(-140%);
    margin: 0;
    padding: 0;
    font-size: 0;
  }

  @media screen and (max-width: $mobile-width) {
    width: 100%;
    margin: 0 0 0 10px;
    box-shadow: $low-shadow;
    padding: 10px 64px 10px 10px;
    animation: blob-in-bottom-notif 300ms $intro-easing;

    .close {
      right: 24px !important;
      transform: scale(1.3) translateY(-25%);
      top: 50% !important;
    }
  }

  .progress-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--theme-color);
    animation-delay: 0;
    animation-name: reduce-width;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    transform-origin: right;
    transition: opacity 200ms linear;
    opacity: 1;

    &.persist {
      opacity: 0;
    }
  }

  .close {
    height: 22px;
    width: 22px;
    padding: 2px 2px 0 0;
    top: 12px;
    right: 12px;
    position: absolute !important;
    cursor: pointer;
    border-radius: 50%;
  }

  .title {
    color: var(--theme-color);

    &.error {
      color: var(--error-color-red);
    }

    &.info {
      color: var(--error-color-green);
    }
  }

  .message {
    word-break: break-all;
  }

  @keyframes reduce-width {
    0% {
      transform: scale3d(1, 1, 1);
    }
    100% {
      transform: scale3d(0, 1, 1);
    }
  }

  @keyframes blob-in-notif {
    0% {
      clip-path: circle(0%);
      transform: translateY(-50px);
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      clip-path: circle(120%);
      transform: translateY(0px);
      opacity: 1;
    }
  }

  @keyframes blob-in-bottom-notif {
    0% {
      clip-path: circle(0%);
      transform: translateY(50px);
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      clip-path: circle(120%);
      transform: translateY(0px);
      opacity: 1;
    }
  }
}
</style>
