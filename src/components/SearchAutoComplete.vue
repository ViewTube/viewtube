<template>
  <div class="search-autocomplete" v-if="visible && searchValue">
    <div
      class="search-autocomplete-entry"
      :class="{ selected: selectedValue == key }"
      v-for="(value, key) in autocompleteValues"
      :key="key"
      :value="value"
      :number="key"
      @mousedown.prevent="onAutocompleteMouseDown"
      @keydown.stop="onKeyDown"
      @mouseover.prevent="onMouseOver"
    >{{ value }}</div>
  </div>
</template>

<script>
import Commons from '@/commons.js'

export default {
  name: 'search-autocomplete',
  props: {
    searchValue: null
  },
  data: function () {
    return {
      autocompleteValues: [],
      visible: false,
      selectedValue: 0
    }
  },
  methods: {
    onAutocompleteMouseDown: function (e) {
      this.$emit('searchValueUpdate', e.target.getAttribute('value'))
      this.$emit('autocompleteEnter')
    },
    onMouseOver: function (e) {
      this.selectedValue = parseInt(e.target.getAttribute('number'))
    }
  },
  watch: {
    searchValue: function () {
      let me = this
      fetch(`${Commons.autocompleteUrl}?q=${me.searchValue}&cl=youtube`, {
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          me.autocompleteValues = [me.searchValue]
          me.autocompleteValues = me.autocompleteValues.concat(data)
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
  background-color: var(--header-bgcolor);
  display: flex;
  flex-direction: column;
  box-shadow: $medium-shadow;

  .search-autocomplete-entry {
    padding: 5px 0 5px 10px;
    cursor: default;
    color: var(--title-color);
    text-decoration: none;
    font-family: $default-font;

    &.selected {
      background-color: var(--bgcolor-alt);
    }
  }

  &.hidden {
    display: none;
  }
}
</style>
