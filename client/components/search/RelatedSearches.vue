<template>
  <div class="related-searches">
    <BadgeButton
      v-for="(keyword, index) in data.entries"
      :key="index"
      class="related-search-tag"
      :href="`results?search_query=${keyword.q}`"
    >
      <p>{{ keyword.q }}</p>
    </BadgeButton>
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

<style></style>
