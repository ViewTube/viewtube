<template>
  <div v-if="visible && searchValue" class="search-autocomplete">
    <div
      v-for="(value, key) in autocompleteValues"
      :key="key"
      class="search-autocomplete-entry"
      :class="{ selected: selectedValue == key }"
      :value="value"
      :number="key"
      @mousedown.prevent="onAutocompleteMouseDown"
      @keydown.stop="onKeyDown"
      @mouseover.prevent="onMouseOver"
    >
      {{ value }}
    </div>
  </div>
</template>

<script lang="ts">
import Axios from 'axios';
// import Commons from '@/plugins/commons.ts';
import Vue from 'vue';

export default Vue.extend({
  name: 'SearchAutocomplete',
  props: {
    searchValue: { type: String, default: null }
  },
  data: () => ({
    autocompleteValues: [],
    visible: false,
    selectedValue: 0
  }),
  watch: {
    searchValue() {
      Axios.get(`${this.$store.getters['environment/apiUrl']}autocomplete`, {
        params: {
          q: this.searchValue
        }
      })
        .then(response => {
          this.autocompleteValues = [this.searchValue].concat(response.data);
        })
        .catch(_ => {});
    }
  },
  methods: {
    onAutocompleteMouseDown(e) {
      this.$emit('searchValueUpdate', e.target.getAttribute('value'));
      this.$emit('autocompleteEnter');
    },
    onMouseOver(e) {
      this.selectedValue = parseInt(e.target.getAttribute('number'));
    }
  }
});
</script>

<style lang="scss" scoped>
.clip-enter-active,
.clip-leave-active {
  transition: clip-path 200ms $intro-easing;
}
.clip-enter-to,
.clip-leave {
  clip-path: polygon(-50% -50%, 150% -50%, 150% 150%, -50% 150%);
}
.clip-enter,
.clip-leave-to {
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
}

.search-autocomplete {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  margin-top: $header-height / 2;
  background-color: var(--header-bgcolor);
  display: flex;
  flex-direction: column;
  box-shadow: $medium-shadow;

  @media screen and (max-width: $mobile-width) {
    top: $header-height / 2;
    position: fixed;
    width: 100%;
  }

  .search-autocomplete-entry {
    padding: 5px 0 5px 10px;
    cursor: default;
    color: var(--title-color);
    text-decoration: none;
    font-family: $default-font;

    &.selected {
      background-color: var(--bgcolor-alt-light);
    }
  }

  &.hidden {
    display: none;
  }
}
</style>
