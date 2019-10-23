<template>
  <div class="search-autocomplete" v-if="searchValue">
    <div
      class="search-autocomplete-entry"
      v-for="(value, key) in autocompleteValues"
      :key="key"
    >{{ value }}</div>
  </div>
</template>

<script>
export default {
  name: 'search-autocomplete',
  props: {
    searchValue: null
  },
  data: function () {
    return {
      autocompleteValues: []
    }
  },
  watch: {
    searchValue: function () {
      let me = this
      fetch(`https://autocomplete.mcdn.ch/?q=${me.searchValue}&cl=youtube`, {
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          me.autocompleteValues = data
        })
        .catch(error => {
          console.error(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.search-autocomplete {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  margin-top: $header-height / 2;
  background-color: $header-bgcolor;
  display: flex;
  flex-direction: column;
  box-shadow: $medium-shadow;

  .search-autocomplete-entry {
    padding: 5px 0 5px 10px;
    cursor: default;
    color: $title-color;
    text-decoration: none;
    font-family: $default-font;

    &:hover,
    &.selected {
      background-color: $bgcolor-alt;
    }
  }

  &.hidden {
    display: none;
  }
}
</style>
