<template>
  <div v-if="videoElement" class="video-endscreen" :class="{ 'card-hover': hover }">
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

<script lang="ts">
import EndscreenCard from '@/components/videoplayer/EndscreenCard.vue';
import { defineComponent, onMounted, ref } from '@nuxtjs/composition-api';

import Vue from 'vue';
import { useAccessor } from '~/store';

export default defineComponent({
  name: 'VideoEndscreen',
  components: {
    EndscreenCard
  },
  props: {
    videoId: String,
    videoProgress: Number,
    videoElement: null
  },
  setup(props) {
    const accessor = useAccessor();
    const endscreenData = ref([]);
    const hover = ref(false);

    const fetchEndscreenData = () => {
      fetch(`${accessor.environment.apiUrl}video/getEndscreen.php?videoId=${props.videoId}`, {
        cache: 'force-cache',
        method: 'GET'
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
        })
        .then(data => {
          endscreenData.value = data;
        })
        .catch(_ => {});
    };

    const onCardEnter = () => {
      hover.value = true;
    };
    const onCardLeave = () => {
      hover.value = false;
    };

    return {
      endscreenData,
      hover,
      fetchEndscreenData,
      onCardEnter,
      onCardLeave
    };
  }
});
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
