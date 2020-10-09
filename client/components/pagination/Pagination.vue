<template>
  <div class="pagination">
    <div class="pagination-container">
      <BadgeButton><ChevronLeftIcon /></BadgeButton>
      <BadgeButton><ChevronRightIcon /></BadgeButton>
    </div>
  </div>
</template>

<script lang="ts">
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';

import Vue from 'vue';

export default Vue.extend({
  name: 'Pagination',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    BadgeButton
  },
  props: {
    currentPage: Number
  }
});
</script>

<style lang="scss"></style>
