<template>
  <div class="pagination">
    <div class="pagination-container">
      <BadgeButton v-tippy="'Go to the first page'"><DoubleChevronLeftIcon /></BadgeButton>
      <BadgeButton v-tippy="'Go to the previous page'"><ChevronLeftIcon /></BadgeButton>
      <BadgeButton v-tippy="'Go to the next page'"><ChevronRightIcon /></BadgeButton>
    </div>
  </div>
</template>

<script lang="ts">
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import DoubleChevronLeftIcon from 'vue-material-design-icons/ChevronDoubleLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
import BadgeButton from '@/components/buttons/BadgeButton.vue';

import Vue from 'vue';

export default Vue.extend({
  name: 'Pagination',
  components: {
    ChevronLeftIcon,
    DoubleChevronLeftIcon,
    ChevronRightIcon,
    BadgeButton
  },
  props: {
    currentPage: Number
  }
});
</script>

<style lang="scss"></style>
