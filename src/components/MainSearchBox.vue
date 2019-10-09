<template>
  <div class="search-box" :class="{ focused: searchFieldFocused }">
    <input
      type="search"
      name="search"
      id="search"
      ref="searchField"
      placeholder="search"
      @focus="onSearchFieldFocused"
      @blur="onSearchFieldBlur"
      @keydown="onSearchFieldKeydown"
      :value="$route.query.search_query !== undefined ? $route.query.search_query : ''"
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
    <div class="search-autocomplete-container"></div>
  </div>
</template>

<script>
export default {
  name: 'main-search-box',
  data: function () {
    return {
      searchFieldFocused: false
    }
  },
  methods: {
    onSearchFieldFocused: function () {

    },
    onSearchFieldBlur: function () {

    },
    onSearchFieldKeydown: function () {

    }
  }
}
</script>

<style>
</style>