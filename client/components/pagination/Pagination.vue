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
        <div :class="{ display: displayFirstDots }" class="dots"><p>...</p></div>
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
        <div :class="{ display: displaySecondDots }" class="dots"><p>...</p></div>
        <BadgeButton
          v-if="pageCount > 1"
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
      return 1;
    },
    pageCountDisplay() {
      if (this.pageCountKnown && this.pageCount > 1) {
        const numArray = [];
        const halfMaxNum = Math.floor(this.maxNumber / 2);
        let numStart = null;
        let numStop = null;
        // debugger;
        if (this.currentPage > 0 && this.currentPage <= halfMaxNum) {
          // If the selected page is smaller than half the shown numbers, it always starts at 2
          // [1] (2) (3) (4) (5)
          numStart = 2;
        } else if (this.currentPage + halfMaxNum > this.pageCount) {
          numStart = this.pageCount - this.maxNumber;
          console.log(numStart, numStop);
        } else {
          numStart = this.currentPage - halfMaxNum;
        }
        numStart = numStart <= 1 ? 2 : numStart;

        if (
          this.currentPage > this.pageCount - this.maxNumber &&
          this.pageCount <= this.maxNumber
        ) {
          numStop = this.pageCount;
        } else if (this.currentPage - numStart < halfMaxNum) {
          numStop = this.currentPage + this.maxNumber - (this.currentPage - numStart);
        } else {
          numStop = this.currentPage + halfMaxNum;
        }
        numStop = numStop >= this.pageCount ? this.pageCount : numStop;

        for (let index = numStart; index < numStop; index++) {
          numArray.push(index);
        }
        return numArray;
      }
      return [];
    },
    displayFirstDots() {
      if (this.pageCountDisplay[0] > 2) {
        return true;
      }
      return false;
    },
    displaySecondDots() {
      // debugger;
      return this.pageCountDisplay[this.pageCountDisplay.length - 1] !== this.largestNumber - 1;
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
        margin: 0;
        width: 0;
        overflow: hidden;
        text-align: center;
        transition: width 300ms $intro-easing, margin 300ms $intro-easing;

        &.display {
          width: 12px;
          margin: 0 10px 0 5px;
        }

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
