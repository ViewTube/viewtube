<template>
  <transition name="fade-up">
    <div
      class="miniplayer"
      v-if="$store.state.miniplayer.currentVideo && visible && !dismissed"
      :style="{
      top: `${Math.floor(positionTop)}px`,
      left: `${Math.floor(positionLeft)}px`,
      transform: `translate3d(calc(-50% + ${Math.floor(dragOffsetLeft)}px), calc(-10% + ${Math.floor(dragOffsetTop)}px), 0)`
    }"
      :class="{animated: transition}"
      ref="miniplayer"
    >
      <div
        class="drag-space"
        @mousedown.prevent="onDragSpaceMouseDown"
        @touchstart.prevent="onDragSpaceTouchStart"
        tabindex="0"
        :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
      ></div>
      <VideoPlayer
        :video="$store.state.miniplayer.currentVideo"
        :mini="true"
        :autoplay="true"
        @close="hide"
      />
    </div>
  </transition>
</template>

<script>
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue'
import Commons from '@/plugins/commons.js'

export default {
  name: 'miniplayer',
  components: {
    VideoPlayer
  },
  data() {
    return {
      video: this.$store.state.miniplayer.currentVideo,
      dismissed: false,
      dragging: false,
      positionTop: 200,
      positionLeft: 200,
      startPositionTop: 0,
      startPositionLeft: 0,
      dragOffsetTop: 0,
      dragOffsetLeft: 0,
      transition: false
    }
  },
  mounted() {
    this.dismissed = false
  },
  computed: {
    visible() {
      return this.$route.name !== 'watch'
    }
  },
  methods: {
    hide() {
      this.dismissed = true
    },
    onDragSpaceMouseDown(e) {
      this.dragging = true
      this.startPositionTop = e.pageY
      this.startPositionLeft = e.pageX
      document.addEventListener('mousemove', this.onDragSpaceMouseMove)
      document.addEventListener('mouseup', this.onDragSpaceMouseUp)
    },
    onDragSpaceTouchStart(e) {
      this.dragging = true
      this.startPositionTop = e.touches[0].pageY
      this.startPositionLeft = e.touches[0].pageX
      document.addEventListener('touchmove', this.onDragSpaceTouchMove)
      document.addEventListener('touchend', this.onDragSpaceTouchEnd)
    },
    onDragSpaceTouchMove(e) {
      const mouseOutOfScreenY = Boolean(e.touches[0].pageY < 0 || e.touches[0].pageY > Commons.getPageHeight())
      const mouseOutOfScreenX = Boolean(e.touches[0].pageX < 0 || e.touches[0].pageX > Commons.getPageWidth())
      if (mouseOutOfScreenY || mouseOutOfScreenX) {
        this.dragging = false
      } else {
        this.calculateDrag(e.touches[0].pageX, e.touches[0].pageY)
      }
    },
    onDragSpaceTouchEnd(e) {
      this.calculateFinish(e.changedTouches[0].pageX, e.changedTouches[0].pageY)
      this.dragging = false

      document.removeEventListener('touchmove', this.onDragSpaceMouseMove)
      document.removeEventListener('touchend', this.onDragSpaceTouchEnd)
    },
    onDragSpaceMouseUp(e) {
      this.calculateFinish(e.pageX, e.pageY)
      this.dragging = false
      document.removeEventListener('mousemove', this.onDragSpaceMouseMove)
      document.removeEventListener('mouseup', this.onDragSpaceMouseUp)
    },
    onDragSpaceMouseMove(e) {
      const mouseOutOfScreenY = Boolean(e.pageY < 0 || e.pageY > Commons.getPageHeight())
      const mouseOutOfScreenX = Boolean(e.pageX < 0 || e.pageX > Commons.getPageWidth())
      if (mouseOutOfScreenY || mouseOutOfScreenX) {
        this.calculateFinish(e.pageX, e.pageY)
        this.dragging = false
      } else {
        this.calculateDrag(e.pageX, e.pageY)
      }
    },
    calculateDrag(posX, posY) {
      if (this.dragging) {
        const halfElementWidth = this.$refs.miniplayer.clientWidth / 2
        const tenthElementHeight = this.$refs.miniplayer.clientHeight / 10

        let positionLeft = 0
        let positionTop = 0

        if (posX - halfElementWidth < 0) {
          positionLeft = posX - (0 - (posX - halfElementWidth)) / -1.5
        } else if (posX + halfElementWidth > Commons.getPageWidth()) {
          positionLeft = posX - (Commons.getPageWidth() - (posX + halfElementWidth)) / -1.5
        } else {
          positionLeft = posX
        }

        if (posY - tenthElementHeight < 0) {
          positionTop = posY - (0 - (posY - tenthElementHeight)) / -1.5
        } else if (posY + (tenthElementHeight * 9) > Commons.getPageHeight()) {
          positionTop = posY - (Commons.getPageHeight() - (posY + (tenthElementHeight * 9))) / -1.5
        } else {
          positionTop = posY
        }

        this.dragOffsetTop = positionTop - this.startPositionTop
        this.dragOffsetLeft = positionLeft - this.startPositionLeft
      }
    },
    calculateFinish(posX, posY) {
      this.transition = true
      const me = this
      setTimeout(() => {
        me.transition = false
      }, 600)
      const pageWidth = Commons.getPageWidth()
      const pageHeight = Commons.getPageHeight()
      const halfElementWidth = this.$refs.miniplayer.clientWidth / 2
      const tenthElementHeight = this.$refs.miniplayer.clientHeight / 10

      // Top left
      if (posX < pageWidth / 2 && posY < pageHeight / 2) {
        this.positionTop = tenthElementHeight + 60
        this.positionLeft = halfElementWidth
        // Top right
      } else if (posX > pageWidth / 2 && posY < pageHeight / 2) {
        this.positionTop = tenthElementHeight + 60
        this.positionLeft = pageWidth - halfElementWidth
        // Bottom right
      } else if (posX > pageWidth / 2 && posY > pageHeight / 2) {
        this.positionTop = pageHeight - tenthElementHeight * 9
        this.positionLeft = pageWidth - halfElementWidth
        // Bottom left
      } else if (posX < pageWidth / 2 && posY > pageHeight / 2) {
        this.positionTop = pageHeight - tenthElementHeight * 9
        this.positionLeft = halfElementWidth
      }

      this.dragOffsetTop = 0
      this.dragOffsetLeft = 0
    }
  },
  watch: {
    visible(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.dismissed = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 300ms $intro-easing;
}
.fade-up-enter-to,
.fade-up-leave {
  opacity: 1;
}
.fade-up-enter,
.fade-up-leave-to {
  opacity: 0;
}

.miniplayer {
  position: fixed;
  width: 500px;
  height: 280px;
  z-index: 800;
  cursor: grab;
  box-shadow: $max-shadow;

  &.animated {
    transition: 500ms $overshoot-easing;
  }

  &:focus {
    cursor: grabbing;
  }

  .drag-space {
    z-index: 15;
    position: absolute;
    left: 0;
    top: 0;
    width: 70%;
    height: 20%;
    transition: opacity 300ms $intro-easing;
    opacity: 0;

    &:hover {
      opacity: 1;
      transition: opacity 300ms 300ms $intro-easing;
      height: 100%;
      width: 100%;

      &:before {
        content: "Click and drag...";
        font-size: 1.4rem;
        margin: 4px;
        width: 50%;
        padding: 2px 2px 2px 10px;
        box-shadow: $max-shadow;
        background-color: #00000070;
        border-radius: 4px;
        display: block;
      }
    }
  }

  @media screen and (max-width: 1100px) {
    width: 450px;
    height: 250px;
  }

  @media screen and (max-width: 900px) {
    width: 400px;
    height: 225px;
  }

  @media screen and (max-width: 700px) {
    width: 300px;
    height: 170px;
  }

  @media screen and (max-width: 500px) {
    width: 250px;
    height: 140px;
  }
}
</style>
