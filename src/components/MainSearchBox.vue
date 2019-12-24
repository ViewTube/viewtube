<template>
  <div class="search-box" :class="{ focused: searchFieldFocused, scrolled: scrollTop }">
    <input
      type="text"
      name="search"
      id="search"
      ref="searchField"
      placeholder="search"
      @focus="onSearchFieldFocused"
      @blur="onSearchFieldBlur"
      @keydown="onSearchFieldKeydown"
      @input="onSearchFieldChange"
      :value="localSearchValue"
    />
    <a
      :href="`/results?search_query=${this.searchValue}`"
      @click.self.prevent="onSearchButton"
      class="search-btn ripple tooltip"
      data-tippy-content="click or press enter to search"
    >
      <SearchIcon />
    </a>
    <span class="search-line-bottom line"></span>
    <SearchAutoComplete
      :searchValue="searchValue"
      ref="autocomplete"
      @searchValueUpdate="onAutocompleteUpdate"
      @autocompleteEnter="onAutocompleteEnter"
    />
  </div>
</template>

<script>
import SearchIcon from 'icons/Magnify.vue'
import SearchAutoComplete from '@/components/SearchAutoComplete'

export default {
  name: 'main-search-box',
  components: {
    SearchIcon,
    SearchAutoComplete
  },
  props: {
    scrollTop: Boolean
  },
  data: () => ({
    searchFieldFocused: false,
    localSearchValue: '',
    searchValue: ''
  }),
  mounted() {
    this.updateSearchValueFromUrl()
  },
  methods: {
    updateSearchValueFromUrl() {
      if (this.$route.query.search_query !== undefined) {
        this.searchValue = this.$route.query.search_query
      } else {
        this.searchValue = ''
      }
    },
    onAutocompleteUpdate(value) {
      this.searchValue = value
    },
    onSearchFieldChange(e) {
      this.searchValue = e.target.value
    },
    onSearchFieldFocused() {
      this.$refs.autocomplete.visible = true
      this.searchFieldFocused = true
    },
    onSearchFieldBlur() {
      this.$refs.autocomplete.visible = false
      this.searchFieldFocused = false
    },
    onAutocompleteEnter() {
      this.searchRedirect(this.searchValue)
    },
    onSearchFieldKeydown(e) {
      let autocomplete = this.$refs.autocomplete
      if (e.key === 'Enter' && this.searchValue !== '') {
        this.searchValue = this.localSearchValue
        this.searchRedirect(this.searchValue)
      } else if (e.key === 'ArrowDown') {
        if (autocomplete.selectedValue + 2 <= autocomplete.autocompleteValues.length) {
          autocomplete.selectedValue += 1
          this.localSearchValue = autocomplete.autocompleteValues[autocomplete.selectedValue]
        }
      } else if (e.key === 'ArrowUp') {
        if (autocomplete.selectedValue - 1 >= 0) {
          autocomplete.selectedValue -= 1
          this.localSearchValue = autocomplete.autocompleteValues[autocomplete.selectedValue]
        }
      }
      e.stopPropagation()
      return true
    },
    onSearchButton() {
      if (this.searchValue) {
        this.searchRedirect(this.searchValue)
      }
    },
    searchRedirect(searchValue) {
      this.$router.push(`/results?search_query=${searchValue}`)
      this.$refs.searchField.blur()
    }
  },
  watch: {
    '$route'(to, from) {
      this.updateSearchValueFromUrl()
    },
    searchValue(newValue) {
      this.localSearchValue = newValue
    }
  }
}
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
  z-index: 800;

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
    }
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
