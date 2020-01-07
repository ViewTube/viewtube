<template>
  <div class="video-endscreen" v-if="videoElement" :class="{ 'card-hover': hover }">
    <EndscreenCard
      v-for="(card, index) in endscreenData"
      :key="index"
      :card="card"
      :videoProgress="videoProgress"
      :videoHeight="videoElement.clientHeight"
      :videoWidth="videoElement.clientWidth"
      @cardenter="onCardEnter"
      @cardleave="onCardLeave"
    />
  </div>
</template>

<script>
import Commons from '@/commons.js'
import EndscreenCard from '@/components/videoplayer/EndscreenCard'

export default {
  name: 'video-endscreen',
  components: {
    EndscreenCard
  },
  props: {
    videoId: String,
    videoProgress: Number,
    videoElement: null
  },
  data: () => ({
    endscreenData: [],
    hover: false
  }),
  mounted() {
    fetch(`${Commons.getOwnApiUrl()}video/getEndscreen.php?videoId=${this.videoId}`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        }
      })
      .then(data => {
        this.endscreenData = data
      })
      .catch(error => {
        console.error(error)
      })
  },
  methods: {
    onCardEnter() {
      this.hover = true
    },
    onCardLeave() {
      this.hover = false
    }
  }
}
</script>

<style lang="scss" scoped>
.video-endscreen {
  position: absolute;
  margin: auto;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 139;
  pointer-events: none;
  transition: background-color 300ms $intro-easing;

  &.card-hover {
    background-color: #00000062;
  }
}
</style>
