<template>
  <div v-if="storyboardImages" class="seekbar-preview">
    <div v-for="(imgSrc, id) in storyboardBaseImages" :key="id" class="preview-image">
      <img
        v-if="currentImg.imgId === id"
        :src="imgSrc"
        :style="{
          transform: `translate3d(-${currentImg.posX}px,-${currentImg.posY}px,0)`
        }"
        alt="Seekbar preview"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, onMounted } from '@nuxtjs/composition-api';
// import { WebVTTParser } from '@/plugins/services/webVTTParser';
// import { useAccessor } from '@/store';

export default defineComponent({
  name: 'SeekbarPreview',
  props: {
    time: {
      type: Number,
      required: true
    },
    storyboards: {
      type: Array,
      required: true
    },
    videoId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    // const accessor = useAccessor();
    const storyboardVTT = ref(null);
    const storyboardImages = ref(null);
    const storyboardBaseImages = ref([]);
    const currentImg = reactive({
      imgId: 0
    });

    onMounted(() => {
      //   .storyboards({
      //     id: props.videoId,
      //     params: {
      //       width: 160,
      //       height: 90
      //     }
      //   })
      //   .then(response => {
      //     storyboardVTT.value = response.data;
      //     parseVTTData();
      //   })
      //   .catch(_ => {});
    });

    // const parseVTTData = () => {
    //   // eslint-disable-next-line no-undef
    //   const parser = new WebVTTParser();
    //   const tree = parser.parse(storyboardVTT.value, 'metadata');
    //   let baseImgCounter = -1;
    //   storyboardImages.value = tree.cues.map(
    //     (el: { text: string; startTime: any; endTime: any }) => {
    //       const src = el.text.split('#')[0];
    //       const pos = el.text.split('#')[1].replace('xywh=', '');
    //       const posX = pos.split(',')[0];
    //       const posY = pos.split(',')[1];

    //       if (!storyboardBaseImages.value.find(el => el === src)) {
    //         storyboardBaseImages.value.push(src);
    //         baseImgCounter++;
    //       }

    //       return {
    //         startTime: el.startTime,
    //         endTime: el.endTime,
    //         imgId: baseImgCounter,
    //         posX,
    //         posY
    //       };
    //     }
    //   );
    // };

    watch(
      () => props.time,
      () => {
        if (storyboardImages.value) {
          const newCurrentImg = storyboardImages.value.find(
            (element: { startTime: number; endTime: number }) => {
              return element.startTime < props.time && element.endTime > props.time;
            }
          );
          currentImg.imgId = newCurrentImg.imgId || 0;
        }
      }
    );

    return {
      storyboardVTT,
      storyboardImages,
      storyboardBaseImages,
      currentImg
    };
  }
});
</script>

<style lang="scss" scoped>
.seekbar-preview {
  width: 160px;
  height: 90px;
  margin: 0 0 0 -11px;
  position: absolute;
  bottom: 40px;
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
