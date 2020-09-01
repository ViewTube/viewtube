<template>
  <div class="share-options">
    <div class="share-options-container">
      <ShareOptionEntry
        optionName="Reddit">
          <Reddit class="reddit-icon"/>
      </ShareOptionEntry>
      <ShareOptionEntry
        optionName="CopyLink">
          <Copy class="copy-icon"/>
      </ShareOptionEntry>
    </div>
  </div>
</template>

<script>
import ShareOptionEntry from '@/components/list/ShareOptionEntry'
import Reddit from 'vue-material-design-icons/Reddit'
import Copy from 'vue-material-design-icons/ContentCopy'

export default {
  name: 'ShareOptions',
  components: {
    ShareOptionEntry,
    Reddit,
    Copy
  },
  props: {
    shareOptions: Array
  }
}
</script>

<style lang="scss">
.share-options {
  .share-options-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }
}
</style>
