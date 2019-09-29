<template>
  <div class="comment">
    <router-link class="comment-author" :to="{path: '/channel/' + channel.authorId}">
      <img :src="comment.authorThumbnails[2].url" :alt="comment.author" />
      <p>{{ comment.author }}</p>
    </router-link>
    <div class="comment-content">
      <div class="comment-title">
        <h4>{{ comment.content }}</h4>
      </div>
    </div>
    <div class="comment-actions"></div>
  </div>
</template>

<script>
export default {
  name: 'comment',
  props: {
    comment: null
  }
}
</script>

<style lang="scss" scoped>
</style>