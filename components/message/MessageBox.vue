<template>
  <div
    class="message-box"
    ref="interactElement"
    @mouseover="onMessageMouseover"
    :class="{ 'dismissed-right': dismissedRight, 'dismissed-left': dismissedLeft, 'is-animating': isInteractAnimating }"
    :style="{ transform: transformString, opacity: swipeOpacity }"
  >
    <div
      class="close"
      @click="dismissMessage"
      v-ripple
      :style="{ transition: `transform ${dismissTimeout}ms linear` }"
    >
      <CloseIcon />
    </div>
    <h3 class="title" :class="message.type">{{ message.title }}</h3>
    <p class="message" v-html="message.message"></p>
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close'
import interact from 'interactjs'

export default {
  name: 'message-box',
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
  props: {
    message: {
      type: Object
    }
  },
  mounted() {
    if (this.message.dismissDelay > 0) {
      this.dismissTimeout = setTimeout(this.dismissMessage, this.message.dismissDelay)
    }
    const element = this.$refs.interactElement
    interact(element).draggable({
      onstart: () => {
        this.isInteractAnimating = false
      },
      onmove: e => {
        const x = this.interactPosition.x + e.dx
        const opacity = 1 - Math.abs(this.interactPosition.x / 300)
        this.interactSetPosition({ x }, opacity)
      },
      onend: () => {
        const x = this.interactPosition.x
        const iXThr = this.interactXThreshold
        this.isInteractAnimating = true

        if (x > iXThr) {
          this.dismissMessage()
        } else if (x < -iXThr) {
          this.dismissMessageLeft()
        } else {
          this.resetCardPosition()
        }
      }
    })
  },
  components: {
    CloseIcon
  },
  computed: {
    transformString() {
      if (!this.isInteractAnimating) {
        const { x, y } = this.interactPosition
        return `translate3D(${x}px, ${y}px, 0)`
      }
      return null
    }
  },
  methods: {
    dismissMessage() {
      this.dismissedRight = true
      this.swipeOpacity = 0
      setTimeout(() => this.message.dismiss(), 600)
    },
    dismissMessageLeft() {
      this.dismissedLeft = true
      this.swipeOpacity = 0
      setTimeout(() => this.message.dismiss(), 600)
    },
    onMessageMouseover() {
      if (this.dismissTimeout) {
        clearTimeout(this.dismissTimeout)
      }
    },
    interactSetPosition(coordinates, distance) {
      const { x = 0, y = 0 } = coordinates
      this.interactPosition = { x, y }
      this.swipeOpacity = distance
    },
    resetCardPosition() {
      this.interactSetPosition({ x: 0, y: 0 }, 1)
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
  user-select: none;

  &.is-animating {
    transition: transform 300ms, opacity 600ms;
  }

  &.dismissed-right {
    transition: transform 300ms, font-size 300ms 300ms, margin 300ms 300ms,
      padding 300ms 300ms, opacity 300ms !important;
    transition-timing-function: $dynamic-easing;
    transform: translateX(140%);
    margin: 0;
    padding: 0;
    font-size: 0;
  }

  &.dismissed-left {
    transition: transform 300ms, font-size 300ms 300ms, margin 300ms 300ms,
      padding 300ms 300ms, opacity 300ms !important;
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
