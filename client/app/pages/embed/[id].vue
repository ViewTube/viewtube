<script setup lang="ts">
import type { ApiDto, ApiErrorDto } from '@viewtube/shared';

definePageMeta({
  layout: 'embed'
});

const route = useRoute();

const { apiUrl } = useApiUrl();
const { vtFetch } = useVtFetch();

const { data: video, pending } = useLazyAsyncData<ApiDto<'VTVideoInfoDto'>, ApiErrorDto>(
  route.params.id.toString(),
  () => vtFetch<ApiDto<'VTVideoInfoDto'>>(`${apiUrl.value}videos/${route.params.id}`)
);

const authorToName = author => {
  if (typeof author == 'string') {
    return author;
  } else if (typeof author.name == 'string') {
    return author.name;
  }
  return 'Unknown Author';
};

const watchPageTitle = computed(() => {
  if (video.value) {
    return `${video.value.title} :: ${authorToName(video.value.author)}`;
  } else if (pending.value) {
    return 'Loading...';
  }
  return 'Video Error';
});
</script>

<template>
  <div class="embed">
    <MetaPageHead
      :title="watchPageTitle"
      :description="`${video?.description?.substring(0, 100)}`"
      :image="`${video?.author.thumbnails?.[2]?.url}`"
    />
    <FlipPlayer v-if="video" :video="video" :embed="true" />
  </div>
</template>

<style lang="scss" scoped>
.embed {
  height: 100%;
}
</style>
