<template>
  <div
    class="search-box"
    :class="{
      focused: searchFieldFocused,
      scrolled: scrollTop,
      'has-text': localSearchValue.length > 0
    }"
  >
    <form action="/results" method="get" class="search-form">
      <input
        id="search"
        ref="searchField"
        type="text"
        name="search"
        :value="localSearchValue"
        @focus="onSearchFieldFocused"
        @blur="onSearchFieldBlur"
        @keydown="onSearchFieldKeydown"
        @input="onSearchFieldChange"
      />
      <label class="search-label" for="search">search</label>
    </form>
    <a
      v-ripple
      v-tippy="'Click or press enter to search'"
      :href="`/results?search_query=${searchValue}`"
      class="search-btn tooltip"
      @click.self.prevent="onSearchButton"
    >
      <SearchIcon />
    </a>
    <span class="search-line-bottom line" />
    <SearchAutoComplete
      ref="autocomplete"
      :search-value="searchValue"
      @searchValueUpdate="onAutocompleteUpdate"
      @autocompleteEnter="onAutocompleteEnter"
    />
  </div>
</template>

<script lang="ts">
import SearchIcon from 'vue-material-design-icons/Magnify.vue';
import SearchAutoComplete from '@/components/SearchAutoComplete.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'MainSearchBox',
  components: {
    SearchIcon,
    SearchAutoComplete
  },
  props: {
    scrollTop: { type: Boolean, required: false }
  },
  data: () => ({
    searchFieldFocused: false,
    localSearchValue: '',
    searchValue: ''
  }),
  fetch() {
    this.updateSearchValueFromUrl();
  },
  watch: {
    $route() {
      this.updateSearchValueFromUrl();
    },
    searchValue(newValue: string) {
      this.localSearchValue = newValue;
    }
  },
  mounted() {
    this.updateSearchValueFromUrl();
  },
  methods: {
    updateSearchValueFromUrl() {
      if (this.$route.query.search_query !== undefined) {
        this.searchValue = this.$route.query.search_query;
        if (process.server) {
          this.localSearchValue = this.$route.query.search_query;
        }
      } else {
        this.searchValue = '';
      }
    },
    onAutocompleteUpdate(value: string) {
      this.searchValue = value;
    },
    onSearchFieldChange(e: any) {
      this.searchValue = e.target.value;
    },
    onSearchFieldFocused() {
      this.$refs.autocomplete.visible = true;
      this.searchFieldFocused = true;
    },
    onSearchFieldBlur() {
      this.$refs.autocomplete.visible = false;
      this.searchFieldFocused = false;
    },
    onAutocompleteEnter() {
      this.searchRedirect(this.searchValue);
    },
    onSearchFieldKeydown(e: any) {
      const autocomplete = this.$refs.autocomplete;
      if (e.key === 'Enter' && this.searchValue !== '') {
        this.searchValue = this.localSearchValue;
        this.searchRedirect(this.searchValue);
      } else if (e.key === 'ArrowDown') {
        if (autocomplete.selectedValue + 2 <= autocomplete.autocompleteValues.length) {
          autocomplete.selectedValue += 1;
        } else {
          autocomplete.selectedValue = 0;
        }
        this.localSearchValue = autocomplete.autocompleteValues[autocomplete.selectedValue];
      } else if (e.key === 'ArrowUp') {
        if (autocomplete.selectedValue - 1 >= 0) {
          autocomplete.selectedValue -= 1;
        } else {
          autocomplete.selectedValue = autocomplete.autocompleteValues.length - 1;
        }
        this.localSearchValue = autocomplete.autocompleteValues[autocomplete.selectedValue];
      }
      e.stopPropagation();
      return true;
    },
    onSearchButton() {
      if (this.searchValue) {
        this.searchRedirect(this.searchValue);
      }
    },
    searchRedirect(searchValue: string) {
      this.$router.push(`/results?search_query=${searchValue}`);
      this.$refs.searchField.blur();
    }
  }
});
</script>

<style lang="scss" scoped>
.search-box {
  display: flex;
  flex-direction: row;
  height: 32px;
  margin: auto;
  width: 100%;
  max-width: $search-box-width;
  justify-content: flex-end;
  position: relative;
  border-radius: 3px;
  background-color: var(--bgcolor-translucent);
  transition: background-color 300ms $intro-easing;
  z-index: +1;

  &.scrolled {
    background-color: var(--bgcolor-alt-light);

    .search-btn {
      color: var(--theme-color);
    }
  }

  .search-btn {
    text-decoration: none;
    color: var(--subtitle-color);
    transition: color 300ms $intro-easing;
    width: 50px;
    text-align: center;
    display: flex;
    user-select: none;

    .material-design-icon {
      margin: auto;
      left: -3px !important;
      display: flex;
    }
  }

  .search-form {
    position: relative;
    left: 0;
    width: 100%;

    .search-label {
      position: absolute;
      left: 0;
      top: 0;
      line-height: 32px;
      text-align: center;
      pointer-events: none;
      user-select: none;
      transition: opacity 300ms $intro-easing, transform 300ms $intro-easing;
      margin: 0 0 0 10px;
      color: var(--subtitle-color-light);
    }

    #search {
      width: 100%;
      height: 100%;
      border: none;
      color: var(--title-color);
      font-size: 1rem;
      margin: 0 0 0 10px;
      min-width: 0px;
      visibility: visible;
      background-color: transparent;
      position: relative;

      &:target {
        all: unset;
      }

      &:focus {
        outline: none;
      }
    }
    #search:focus + .search-label {
      opacity: 0;
      transform: translateX(10px);
    }
  }

  &.focused,
  &.has-text {
    .search-label {
      opacity: 0;
      transform: translateX(10px);
    }
  }
  &.focused {
    .line {
      transform: scale(1);
    }
  }

  .line {
    position: absolute;
    background-color: var(--theme-color);
    height: 1.5px;
    width: 1.5px;
    transform: scale(0);
    transition: transform 300ms $intro-easing;
  }

  .search-line-bottom {
    bottom: 0;
    left: 0;
    width: 100%;
    transform-origin: left;
  }
}
</style>
