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

  let previewImageUrl = previewThumbnailTemplate.urlTemplate;
  let previewImageNr = 0;
  const thumbnailCountPerImg = previewThumbnailTemplate.columns * previewThumbnailTemplate.rows;
  let secondsPerThumbnail = video.duration.seconds / thumbnailCountPerImg;

  if (previewThumbnailTemplate.previewThumbnailCount > 1) {
    secondsPerThumbnail = previewThumbnailTemplate.interval / 1000;
    const thumbnailNr = Math.floor(props.hoveredTime / secondsPerThumbnail);
    const thumbnailsPerImage = previewThumbnailTemplate.columns * previewThumbnailTemplate.rows;

    previewImageNr = Math.floor(thumbnailNr / thumbnailsPerImage);
    previewImageUrl = previewImageUrl.replace('M$M', `M${previewImageNr}`);
  }

  const currentImageSeconds =
    props.hoveredTime - previewImageNr * thumbnailCountPerImg * secondsPerThumbnail;
  const currentThumbnailNr = Math.floor(currentImageSeconds / secondsPerThumbnail);

  const thumbnailColumn = currentThumbnailNr % previewThumbnailTemplate.columns;
  const thumbnailRow = Math.floor(currentThumbnailNr / previewThumbnailTemplate.columns);

  const aspectRatio = previewThumbnailTemplate.width / previewThumbnailTemplate.height;

  const thumbnailWidth = 200;
  const thumbnailHeight = thumbnailWidth / aspectRatio;

  return {
    previewUrl: proxyUrl(previewImageUrl),
    thumbnailColumn,
    thumbnailRow,
    columns: previewThumbnailTemplate.columns,
    rows: previewThumbnailTemplate.rows,
    thumbnailWidth,
    thumbnailHeight
  };
};

const smallThumbnail = computed(() => getPreviewThumbnail(video.previewThumbnails[0]));
const largeThumbnail = computed(() =>
  getPreviewThumbnail(video.previewThumbnails[video.previewThumbnails.length - 1])
);
</script>

<template>
  <div
    v-if="video.previewThumbnails?.length > 0"
    class="flip-seekbar-preview"
    :style="{
      transform: `translate3d(${positionX}, 0, 0)`,
      height: `${largeThumbnail.thumbnailHeight}px`
    }"
  >
    <div
      class="seekbar-preview-image"
      :style="{
        backgroundImage: `url(${smallThumbnail.previewUrl})`,
        backgroundPositionX: `-${smallThumbnail.thumbnailColumn * 200}px`,
        backgroundPositionY: `-${smallThumbnail.thumbnailRow * smallThumbnail.thumbnailHeight}px`,
        backgroundSize: `${smallThumbnail.columns * 200}px ${
          smallThumbnail.rows * smallThumbnail.thumbnailHeight
        }px`
      }"
    />
    <div
      class="seekbar-preview-image"
      :style="{
        backgroundImage: `url(${largeThumbnail.previewUrl})`,
        backgroundPositionX: `-${largeThumbnail.thumbnailColumn * 200}px`,
        backgroundPositionY: `-${largeThumbnail.thumbnailRow * largeThumbnail.thumbnailHeight}px`,
        backgroundSize: `${largeThumbnail.columns * 200}px ${
          largeThumbnail.rows * largeThumbnail.thumbnailHeight
        }px`
      }"
    />
  </div>
</template>

<style lang="scss" scoped>
.flip-seekbar-preview {
  position: absolute;
  left: 0;
  width: 200px;
  bottom: 80px;
  background-repeat: no-repeat;
  pointer-events: none;
  user-select: none;
  opacity: 0;
  transition: opacity 200ms $intro-easing;
  box-shadow: $low-shadow;

  .seekbar-preview-image {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
