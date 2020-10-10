<template>
  <div class="pagination">
    <div class="pagination-container">
      <BadgeButton
        v-tippy="'Go to the previous page'"
        :href="`?page=${currentPage - 1}`"
        :internalLink="true"
        :disabled="currentPage <= 1"
      >
        <ChevronLeftIcon />
      </BadgeButton>
      <div class="number-buttons">
        <BadgeButton
          v-tippy="`Go to page 1`"
          :href="`?page=1`"
          :internalLink="true"
          :selected="currentPage === 1"
          class="number-btn"
          >1</BadgeButton
        >
        <div v-if="displayFirstDots" class="dots"><p>...</p></div>
        <BadgeButton
          v-for="number in pageCountDisplay"
          :key="number"
          v-tippy="`Go to page ${number}`"
          :href="`?page=${number}`"
          :internalLink="true"
          :selected="currentPage === number"
          class="number-btn"
        >
          {{ number }}
        </BadgeButton>
        <div v-if="displaySecondDots" class="dots"><p>...</p></div>
        <BadgeButton
          v-tippy="`Go to page ${largestNumber}`"
          :href="`?page=${largestNumber}`"
          :internalLink="true"
          :selected="currentPage === pageCount"
          class="number-btn"
        >
          {{ largestNumber }}
        </BadgeButton>
      </div>
      <BadgeButton
        v-tippy="'Go to the next page'"
        :href="`?page=${currentPage + 1}`"
        :internalLink="true"
        :disabled="currentPage >= pageCount"
      >
        <ChevronRightIcon />
      </BadgeButton>
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
    currentPage: Number,
    pageCountKnown: Boolean,
    pageCount: Number
  },
  data() {
    return {
      maxNumber: 6
    };
  },
  computed: {
    largestNumber() {
      if (this.pageCountKnown) {
        return this.pageCount;
      }
      return null;
    },
    pageCountDisplay() {
      const numArray = [];
      const halfMaxNum = Math.floor(this.maxNumber / 2);
      let numStart = this.currentPage - halfMaxNum;
      let numStop = this.currentPage + (halfMaxNum - 1);
      if (numStart < 2) {
        numStart = 2;
        numStop = this.maxNumber;
      }
      if (numStop > this.pageCount) {
        numStart -= numStop - this.pageCount;
        numStop = this.pageCount;
      }
      for (let index = numStart; index < numStop; index++) {
        numArray.push(index);
      }
      return numArray;
    },
    displayFirstDots() {
      if (this.pageCountDisplay[0] > 2) {
        return true;
      }
      return false;
    },
    displaySecondDots() {
      // debugger;
      if (this.pageCountDisplay[this.maxNumber - 2] >= this.pageCount - 1) {
        return false;
      }
      return true;
    }
  }
});
</script>

<style lang="scss">
.pagination {
  display: flex;
  flex-direction: row;

  .pagination-container {
    margin: 0 auto;
    display: flex;
    flex-direction: row;

    .number-buttons {
      margin: 0 10px;
      display: flex;
      flex-direction: row;

      .dots {
        display: block;
        margin: 0 10px 0 5px;
        text-align: center;

        p {
          line-height: 30px;
          text-align: center;
        }
      }

      .number-btn {
        padding: 0 5px;
      }
    }
  }
}
</style>
