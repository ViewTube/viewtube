<template>
  <div class="video-entry">
    <a class="video-entry-thmb" href="#">
      <img class="video-entry-thmb-image" alt="Thumbnail" v-bind:src="thumbnailSrc" />
      <span class="video-entry-length">{{ videoLength }}</span>
    </a>
    <div class="video-entry-info">
      <a class="video-entry-title" href="#">{{ videoTitle }}</a>
      <a class="video-entry-channel" href="#">{{ videoAuthor }}</a>
      <div class="video-entry-stats">
        <p class="video-entry-views">{{ viewCount }}</p>
        <p class="video-entry-timestamp">{{ publishedText }}</p>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'VideoEntry',
  props: {
    videoLength: string

  }
}

</script>

<style lang="scss">
</style>
