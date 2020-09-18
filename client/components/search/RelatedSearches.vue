<template>
  <div class="related-searches">
    <p>Related searches</p>
    <div class="related-keywords">
      <BadgeButton
        v-for="(keyword, index) in data.entries"
        :key="index"
        class="related-search-tag"
        :href="`results?search_query=${keyword.q}`"
      >
        <p>{{ keyword.q }}</p>
      </BadgeButton>
    </div>
  </div>
</template>

<script>
import BadgeButton from '@/components/buttons/BadgeButton';

export default {
  name: 'RelatedSearches',
  components: {
    BadgeButton
  },
  props: {
    data: Object
  }
};
</script>

<style lang="scss">
.related-searches {
  overflow: auto hidden;
  scrollbar-width: thin;
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  position: relative;

  .related-keywords {
    display: flex;
    flex-direction: row;
    width: auto;
    position: absolute;
    height: 35px;

    .related-search-tag {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}
</style>
