<template>
  <div
    class="miniplayer"
    v-if="$store.state.miniplayer.currentVideo && visible && !dismissed"
    :style="{
    top: `${positionTop}px`,
    left: `${positionLeft}px`
  }"
  >
    <div
      class="drag-space"
      @mousedown.prevent="onDragSpaceMouseDown"
      @mouseup.prevent="onDragSpaceMouseUp"
      @touchstart.prevent="onDragSpaceTouchStart"
      @touchmove.prevent="onDragSpaceTouchMove"
      @touchend.prevent="onDragSpaceTouchEnd"
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
</template>

<script>
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue'

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
      positionTop: 50,
      positionLeft: 50
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
      document.addEventListener('mousemove', this.onDragSpaceMouseMove)
    },
    onDragSpaceMouseMove(e) {
      console.log(e)
      this.calculateDrag(e)
    },
    calculateDrag(e) {
      if (this.dragging) {
        this.positionTop = e.pageY
        this.positionLeft = e.pageX
      }
    },
    onDragSpaceMouseUp(e) {
      this.dragging = false
      document.removeEventListener('mousemove', this.onDragSpaceMouseMove)
    },
    onDragSpaceTouchStart(e) { },
    onDragSpaceTouchMove(e) { },
    onDragSpaceTouchEnd(e) { }
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
.miniplayer {
  position: fixed;
  width: 500px;
  height: 280px;
  z-index: 800;
  transform: translate(-50%, -10%);
  cursor: grab;
  transition: top 100ms $intro-easing, left 100ms $intro-easing;

  &:focus {
    cursor: grabbing;
  }

  .drag-space {
    z-index: 15;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 20%;
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
}
</style>
