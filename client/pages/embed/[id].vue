<script setup lang="ts">
import VideoPlayer from '@/components/videoplayer/VideoPlayer.vue';
import type { ApiDto, ApiErrorDto } from '@viewtube/shared';

definePageMeta({
  headless: true
});

const route = useRoute();

const { apiUrl } = useApiUrl();
const { vtFetch } = useVtFetch();

const { data: video } = useLazyAsyncData<ApiDto<'VTVideoInfoDto'>, ApiErrorDto>(
  route.params.id.toString(),
  () => vtFetch<ApiDto<'VTVideoInfoDto'>>(`${apiUrl.value}videos/${route.params.id}`)
);
</script>

<template>
  <div class="embed">
    <VideoPlayer
      :video="video"
      :embedded="true"
      class="video-player-p"
      :mini="false"
      :autoplay="false"
    />
  </div>
</template>

<style lang="scss" scoped>
.embed {
  height: 100vh;
  width: 100vw;
}
</style>
