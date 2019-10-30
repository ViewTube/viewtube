<template>
  <div class="video-endscreen" v-if="videoElement">
    <EndscreenCard
      v-for="(card, index) in endscreenData"
      :key="index"
      :card="card"
      :videoProgress="videoProgress"
      :videoHeight="videoElement.clientHeight"
      :videoWidth="videoElement.clientWidth"
      :videoOffsetTop="videoElement.offsetTop"
      :videoOffsetLeft="videoElement.offsetLeft"
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
  data: function () {
    return {
      endscreenData: []
    }
  },
  mounted: function () {
    fetch(`${Commons.getOwnApiUrl()}video/getEndscreen.php?videoId=${this.videoId}`, {
      cache: 'force-cache',
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        this.endscreenData = data
      })
      .catch(error => {
        console.error(error)
      })
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
}
</style>
