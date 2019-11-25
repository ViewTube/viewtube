<template>
  <div class="dropdown">
    <div class="dropdown-btn" @click.prevent="onDropdownBtnClick">
      <p class="dropdown-title">{{ entries[selected].name }}</p>
    </div>
    <div class="dropdown-list" :class="{ open: open }">
      <span
        class="list-entry"
        v-for="(item, id) in entries"
        :key="id"
        :value="item.value"
        @click="select"
      >{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'submit-button',
  props: {
    values: Array,
    value: String
  },
  computed: {
    entries () {
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
    select (e) {
      this.selected = e.target.getAttribute('key')
    },
    onDropdownBtnClick (e) {
      this.open = !this.open
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

    .dropdown-title {
    }
  }

  .dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    transform: scale(0);
    transition: transform 300ms $intro-easing;
    transform-origin: top;
    background-color: $

    .list-entry {
    }

    &.open {
      transform: scale(1);
    }
  }
}
</style>
