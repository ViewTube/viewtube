<template>
  <div
    class="message-box"
    @mouseover="onMessageMouseover"
    :class="{ 'dismissed-right': dismissedRight, 'dismissed-left': dismissedLeft }"
  >
    <div class="close" @click="dismissMessage" v-ripple>
      <span class="progress-circle"></span>
      <span class="progress-circle-1"></span>
      <CloseIcon />
    </div>
    <h3 class="title" :class="message.type">{{ message.title }}</h3>
    <p class="message">{{ message.message }}</p>
  </div>
</template>

<script>
import CloseIcon from 'icons/Close'

export default {
  name: 'message-box',
  data: () => ({
    dismissedRight: false,
    dismissedLeft: false,
    dismissTimeout: null
  }),
  props: {
    message: {
      type: Object
    }
  },
  mounted() {
    this.dismissTimeout = setTimeout(this.dismissMessage, 5000)
  },
  components: {
    CloseIcon
  },
  methods: {
    dismissMessage() {
      this.dismissedRight = true
      setTimeout(() => this.message.dismiss(), 600)
    },
    onMessageMouseover() {
      if (this.dismissTimeout) {
        clearTimeout(this.dismissTimeout)
      }
    }
  }
}
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

  &.dismissed-right {
    transition: transform 300ms, font-size 300ms 300ms, margin 300ms 300ms,
      padding 300ms 300ms;
    transition-timing-function: $dynamic-easing;
    transform: translateX(140%);
    margin: 0;
    padding: 0;
    font-size: 0;
  }

  &.dismissed-left {
    transition: transform 300ms, font-size 300ms 300ms, margin 300ms 300ms,
      padding 300ms 300ms;
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

  .close {
    height: 22px;
    width: 22px;
    padding: 2px 2px 0 0;
    top: 12px;
    right: 12px;
    position: absolute !important;
    cursor: pointer;
    border-radius: 50%;

    .progress-circle {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--theme-color);
      border-radius: 50%;
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 40%);

      &:after {
        content: "";
        top: 10%;
        left: 10%;
        width: 80%;
        height: 80%;
        border-radius: 50%;
        position: absolute;
        display: block;
        background-color: var(--bgcolor-alt);
      }
    }
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
