<template>
  <div
    v-show="descriptionHtml"
    v-create-links
    class="channel-description links"
    v-html="descriptionHtml"
  />
</template>

<script>
export default {
  name: 'ChannelDescription',
  props: {
    descriptionHtml: String
  }
};
</script>

<style lang="scss">
.channel-description {
  width: 100%;
  max-width: $main-width;
  box-sizing: border-box;
  z-index: 10;
  margin: 0 auto;
  padding: 20px 10px;
  z-index: 14;

  pre {
    font-family: unset;
    color: unset;
    width: unset;
    padding: unset;
    margin: unset;
    white-space: pre-wrap;
  }
}
</style>
