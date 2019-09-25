<template>
  <div class="comment">
    <div class="comment-author"></div>
    <div class="comment-content"></div>
    <div class="comment-actions"></div>
  </div>
</template>

<script>
export default {
  name: 'comment',
  props: {
    comment: Array
  }
}
</script>

<style>
</style>