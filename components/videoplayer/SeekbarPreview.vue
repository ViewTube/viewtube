<template>
  <div
    class="seekbar-preview"
    v-if="storyboardImages"
  >
    <div
      class="preview-image"
      v-for="(imgSrc, id) in storyboardBaseImages"
      :key="id"
    >
      <img
        :src="imgSrc"
        v-if="currentImg.imgId === id"
        :style="{ transform: `translate3d(-${currentImg.posX}px,-${currentImg.posY}px,0)` }"
      />
    </div>
  </div>
</template>

<script>
import '@/plugins/services/webVTTParser'
import Invidious from '@/plugins/services/invidious'

export default {
  name: 'seekbar-preview',
  props: {
    time: {
      type: Number
    },
    storyboards: {
      type: Array
    },
    videoId: {
      type: String
    }
  },
  data: () => ({
    storyboardVTT: null,
    storyboardImages: null,
    storyboardBaseImages: [],
    currentImg: {
      imgId: 0
    }
  }),
  mounted() {
    Invidious.api.storyboards({
      id: this.videoId,
      params: {
        width: 160,
        height: 90
      }
    })
      .then(response => {
        this.storyboardVTT = response.data
        this.parseVTTData()
      })
  },
  watch: {
    time(newValue) {
      if (this.storyboardImages) {
        const currentImg = this.storyboardImages.find((element) => {
          return element.startTime < this.time && element.endTime > this.time
        })
        this.currentImg = currentImg ? currentImg : { imgId: 0 }
      }
    }
  },
  methods: {
    parseVTTData() {
      const parser = new WebVTTParser()
      const tree = parser.parse(this.storyboardVTT, 'metadata')
      let baseImgCounter = -1
      this.storyboardImages = tree.cues.map(el => {
        const src = el.text.split('#')[0]
        const pos = el.text.split('#')[1].replace('xywh=', '')
        const posX = pos.split(',')[0]
        const posY = pos.split(',')[1]

        if (!this.storyboardBaseImages.find(el => el === src)) {
          this.storyboardBaseImages.push(src)
          baseImgCounter++
        }

        return {
          startTime: el.startTime,
          endTime: el.endTime,
          imgId: baseImgCounter,
          posX,
          posY
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.seekbar-preview {
  width: 160px;
  height: 90px;
  margin: 0 0 0 -11px;
  position: absolute;
  bottom: 24px;
  background-color: $video-thmb-overlay-bgcolor;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  transition: opacity 300ms $intro-easing;

  .preview-image {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
  }
}
</style>
