<script setup lang="ts">
const props = defineProps<{
  hoveredTime: number;
  positionX: string;
}>();
const { proxyUrl } = useImgProxy();
const video = inject<ApiDto<'VTVideoInfoDto'>>('video');

const getPreviewThumbnail = (
  previewThumbnailTemplate: ApiDto<'VTVideoInfoDto'>['previewThumbnails'][number]
) => {
  if (!previewThumbnailTemplate) {
    return;
  }

  let previewUrl = previewThumbnailTemplate.urlTemplate;
  let previewNr = 0;
  let intervalSeconds = video.duration.seconds;

  if (previewThumbnailTemplate.previewThumbnailCount > 1) {
    // Preview thumbnails interval is specified in tenths of a second (Why YouTube...)
    intervalSeconds = previewThumbnailTemplate.interval / 10;
    previewNr = Math.floor(props.hoveredTime / intervalSeconds);
    previewUrl = previewUrl.replace('M$M', `M${previewNr}`);
  }

  const thumbnailCountPerImg = previewThumbnailTemplate.columns * previewThumbnailTemplate.rows;
  const secondsPerThumbnail = intervalSeconds / thumbnailCountPerImg;
  const currentThumbnailSeconds = props.hoveredTime - previewNr * thumbnailCountPerImg;
  const currentThumbnailNr = Math.floor(currentThumbnailSeconds / secondsPerThumbnail);

  const thumbnailColumn = currentThumbnailNr % previewThumbnailTemplate.columns;
  const thumbnailRow = Math.floor(currentThumbnailNr / previewThumbnailTemplate.columns);

  return {
    previewUrl: proxyUrl(previewUrl),
    thumbnailColumn,
    thumbnailRow,
    columns: previewThumbnailTemplate.columns,
    rows: previewThumbnailTemplate.rows
  };
};

const smallThumbnail = computed(() => getPreviewThumbnail(video.previewThumbnails[2]));
</script>

<template>
  <div
    class="flip-seekbar-preview"
    :style="{
      backgroundImage: `url(${smallThumbnail.previewUrl})`,
      backgroundPositionX: `-${smallThumbnail.thumbnailColumn * 200}px`,
      backgroundPositionY: `-${smallThumbnail.thumbnailRow * 112.5}px`,
      backgroundSize: `${smallThumbnail.columns * 200}px ${smallThumbnail.rows * 112.5}px`,
      transform: `translate3d(${positionX}, 0, 0)`
    }"
  />
</template>

<style lang="scss" scoped>
.flip-seekbar-preview {
  position: absolute;
  left: 0;
  height: 112.5px;
  width: 200px;
  bottom: 40px;
  background-repeat: no-repeat;
  pointer-events: none;
  user-select: none;
  opacity: 0;
  transition: opacity 200ms $intro-easing;
  box-shadow: $low-shadow;
}
</style>
