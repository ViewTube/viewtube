<template>
  <div class="search-box" :class="{ focused: searchFieldFocused }">
    <input
      type="text"
      name="search"
      id="search"
      ref="searchField"
      placeholder="search"
      @focus="onSearchFieldFocused"
      @blur="onSearchFieldBlur"
      @keydown="onSearchFieldKeydown"
      v-model="searchValue"
    />
    <a
      href="#"
      @click.self.prevent="onSearchButton"
      class="search-btn ripple tooltip"
      data-tippy-content="click or press enter to search"
    >
      <SearchIcon />
    </a>
    <span class="search-line-bottom line"></span>
    <SearchAutoComplete :searchValue="searchValue" />
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
  data: function () {
    return {
      searchFieldFocused: false,
      searchValue: ''
    }
  },
  mounted: function () {
    this.updateSearchValueFromUrl()
  },
  methods: {
    updateSearchValueFromUrl: function () {
      if (this.$route.query.search_query !== undefined) {
        this.searchValue = this.$route.query.search_query
      } else {
        this.searchValue = ''
      }
    },
    onSearchFieldFocused: function () {
      this.searchFieldFocused = true
    },
    onSearchFieldBlur: function () {
      this.searchFieldFocused = false
    },
    onSearchFieldKeydown: function (e) {
      if (e.key === 'Enter' && this.searchValue !== '') {
        this.$router.push(`/results?search_query=${this.searchValue}`)
      }
      return true
    },
    onSearchButton: function () {
      let searchValue = this.$refs.searchField.value
      if (searchValue !== '') {
        this.$router.push(`/results?search_query=${searchValue}`)
      }
    }
  },
  watch: {
    '$route' (to, from) {
      this.updateSearchValueFromUrl()
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
  background-color: $bgcolor-alt-light;
  position: relative;
  border-radius: 3px;

  .search-btn {
    text-decoration: none;
    color: $theme-color;
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
    color: $title-color;
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
    background-color: $theme-color;
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
