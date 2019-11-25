<template>
  <div class="dropdown" @clickaway="hideDropdown">
    <div class="dropdown-btn" @click.prevent="onDropdownBtnClick">
      <p class="dropdown-title">{{ entries[selected].name }}</p>
    </div>
    <div class="dropdown-list" :class="{ open: open }">
      <span
        class="list-entry"
        v-for="(item, id) in entries"
        :key="id"
        :index="id"
        :value="item.value"
        @click="select"
      >{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
import { directive as onClickaway } from 'vue-clickaway'

export default {
  name: 'dropdown',
  props: {
    values: Array,
    value: String
  },
  directives: {
    clickaway: onClickaway
  },
  computed: {
    entries() {
      if (this.values[0].value && this.values[0].name) {
        return this.values
      } else {
        return this.values.map((value, index) => {
          return { name: value, value: value }
        })
      }
    }
  },
  data: function () {
    return {
      selected: 0,
      open: false
    }
  },
  methods: {
    select(e) {
      this.selected = e.target.getAttribute('index')
      this.open = false
      this.$emit('valuechange', this.entries[this.selected], this.selected)
    },
    onDropdownBtnClick(e) {
      this.open = !this.open
    },
    hideDropdown() {
      this.open = false
    }
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  height: 50px;
  width: auto;
  display: flex;
  position: relative;

  .dropdown-btn {
    cursor: pointer;
    position: relative;

    .dropdown-title {
      line-height: 50px;
      background-image: $theme-color-primary-gradient;
      background-size: 0% 2px;
      background-position: 0 100%;
      background-repeat: no-repeat;
      background-size: 100% 2px;

      &:after {
        content: "▼";
        position: relative;
        top: 0;
        right: 0;
        margin: 5px;
      }
    }
  }

  .dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    transform-origin: top;
    background-color: $bgcolor-alt;
    display: flex;
    flex-direction: column;
    box-shadow: $max-shadow;
    border-radius: 5px;
    transition: transform 300ms $intro-easing, clip-path 300ms $intro-easing;
    overflow: hidden;
    padding: 5px 0;

    transform: scale(0.8);
    clip-path: polygon(0% 0%, 60% 0%, 60% 0%, 0% 0%);

    &.open {
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
      transform: scale(1);
    }

    .list-entry {
      padding: 6px 10px 6px 10px;
      cursor: pointer;

      &:hover {
        background-color: $bgcolor-alt-light;
      }
    }
  }
}
</style>
