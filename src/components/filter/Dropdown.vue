<template>
  <div class="dropdown" v-clickaway="hideDropdown">
    <div
      class="dropdown-btn"
      @click.stop="onDropdownBtnClick"
      :class="{ 'label-unselected': selected === null }"
    >
      <div class="dropdown-title">
        <p v-if="selected !== null">{{ entries[selected].name }}</p>
        <p v-if="selected === null">{{ label }}</p>
      </div>
      <label class="dropdown-label" v-if="label">{{ label }}</label>
    </div>
    <div class="dropdown-list" :class="{ open: open }">
      <span
        class="list-entry"
        v-for="(item, id) in entries"
        :key="id"
        :index="id"
        :value="item.value"
        @click="select"
        :class="{ selected: selected == id }"
      >{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dropdown',
  props: {
    values: Array,
    value: String,
    label: String,
    noDefault: Boolean
  },
  data: () => ({
    selected: 0,
    open: false
  }),
  mounted() {
    let me = this
    let selectedEntry = this.entries.findIndex(e => e.value === me.value)
    if (this.noDefault && this.value === null) {
      this.selected = selectedEntry !== -1 ? selectedEntry : null
    } else {
      this.selected = selectedEntry !== -1 ? selectedEntry : 0
    }
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
  z-index: 10;

  .dropdown-btn {
    cursor: pointer;
    position: relative;

    &.label-unselected {
      .dropdown-label {
        display: none;
      }

      .dropdown-title {
        p {
          // color: $theme-color;
        }

        &:after{
          color: var(--theme-color);
        }
      }
    }

    .dropdown-label {
      color: var(--theme-color);
      position: absolute;
      top: 0;
      left: 0;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .dropdown-title {
      line-height: 30px;
      background-image: $theme-color-primary-gradient;
      background-size: 0% 2px;
      background-position: 0 100%;
      background-repeat: no-repeat;
      background-size: 100% 2px;
      padding-top: 10px;
      display: flex;
      flex-direction: row;

      p {
        line-height: 40px;
      }

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
    background-color: var(--bgcolor-alt);
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    transition-property: transform, clip-path, box-shadow;
    transition-duration: 300ms;
    transition-timing-function: $intro-easing;
    overflow: hidden;
    padding: 5px 0;
    z-index: 11;

    transform: scale(0.8);
    clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);

    &.open {
      clip-path: polygon(-50% -50%, 150% -50%, 150% 150%, -50% 150%);
      transform: scale(1);
      box-shadow: $max-shadow;
    }

    .list-entry {
      padding: 8px 10px 8px 10px;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background-color: var(--bgcolor-alt-light)
      }
      &.selected {
        color: var(--theme-color);
      }
    }
  }
}
</style>
