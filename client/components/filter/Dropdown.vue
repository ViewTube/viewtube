<template>
  <div ref="dropdownBtn" v-clickaway="hideDropdown" class="dropdown" :class="{ open: open }">
    <div
      v-ripple
      class="dropdown-btn"
      :class="{ 'label-unselected': selected === null }"
      @click.stop="onDropdownBtnClick"
    >
      <div class="dropdown-title">
        <p v-if="selected !== null">
          {{ entries[selected].name }}
        </p>
        <p v-if="selected === null">{{ label }}</p>
      </div>
      <label v-if="label" class="dropdown-label">{{ label }}</label>
    </div>
    <portal v-if="visible" to="dropdown">
      <div
        class="dropdown-list"
        :class="{ open: open }"
        :style="{
          top: `${offsetTop}px`,
          left: `${offsetLeft}px`
        }"
      >
        <span
          v-for="(item, id) in entries"
          :key="id"
          class="list-entry"
          :index="id"
          :value="item.value"
          :class="{ selected: selected == id }"
          @click="select"
          >{{ item.name }}</span
        >
      </div>
    </portal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Dropdown',
  props: {
    values: Array,
    value: String,
    label: String,
    noDefault: Boolean
  },
  data: () => ({
    selected: 0,
    open: false,
    offsetTop: null,
    offsetLeft: null,
    visible: false
  }),
  computed: {
    entries(): Array<{ name: string; value: string }> {
      if (this.values[0].value && this.values[0].name) {
        return this.values;
      } else {
        return this.values.map(value => {
          return { name: value, value };
        });
      }
    }
  },
  mounted() {
    const me = this;
    const selectedEntry = this.entries.findIndex(e => e.value === me.value);
    if (this.noDefault && this.value === null) {
      this.selected = selectedEntry !== -1 ? selectedEntry : null;
    } else {
      this.selected = selectedEntry !== -1 ? selectedEntry : 0;
    }
    this.calculateOffset();
    this.visible = true;
  },
  methods: {
    calculateOffset(): void {
      if (this.$refs.dropdownBtn) {
        const dropdownDimens = this.$refs.dropdownBtn.getBoundingClientRect();
        this.offsetTop = dropdownDimens.top + 50;
        this.offsetLeft = dropdownDimens.left;
      }
    },
    select(e): void {
      this.selected = e.target.getAttribute('index');
      this.open = false;
      this.$emit('valuechange', this.entries[this.selected], this.selected);
    },
    onDropdownBtnClick(): void {
      this.calculateOffset();
      this.open = !this.open;
      window.addEventListener('resize', this.calculateOffset);
    },
    hideDropdown(): void {
      this.calculateOffset();
      this.open = false;
      window.removeEventListener('resize', this.calculateOffset);
    }
  }
});
</script>

<style lang="scss" scoped>
.dropdown {
  height: 50px;
  width: auto;
  display: flex;
  position: relative;
  z-index: 10;

  &:after {
    content: '';
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    position: fixed;
    display: block;
    pointer-events: none;
    background-color: transparent;
    z-index: 400;
    overscroll-behavior: contain;
    transition: background-color 300ms $intro-easing;
  }

  @media screen and (max-width: $mobile-width) {
    &.open:after {
      background-color: var(--bgcolor-translucent);
      pointer-events: auto;
    }
  }

  .dropdown-btn {
    cursor: pointer;
    position: relative;

    &.label-unselected {
      .dropdown-label {
        display: none;
      }

      .dropdown-title {
        &:after {
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
        content: '▼';
        position: relative;
        top: 0;
        right: 0;
        margin: 5px;
      }
    }
  }
}

.dropdown-list {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top;
  background-color: var(--bgcolor-alt);
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  transition-property: transform, clip-path, box-shadow;
  transition-duration: 300ms;
  transition-timing-function: $intro-easing;
  overflow: auto;
  padding: 5px 0;
  z-index: 800;
  margin: 0;

  @media screen and (max-width: $mobile-width) {
    width: calc(100% - 28px) !important;
    top: 50vh !important;
    left: 0 !important;
    margin: 0 10px !important;
    box-sizing: border-box;
    position: fixed;
    transform: scale(0) translateY(-50%) !important;
    clip-path: none !important;
    transform-origin: center top !important;
    transition: opacity 300ms 0ms $intro-easing, transform 600ms $outro-easing, box-shadow 300ms,
      pointer-events 0ms !important;
    opacity: 0;
    pointer-events: none !important;

    &.open {
      clip-path: none !important;
      transform: scale(1) translateY(-50%) !important;
      transition: opacity 200ms 100ms $intro-easing,
        transform 300ms cubic-bezier(0, 0.98, 0.21, 0.98), box-shadow 300ms !important;
      opacity: 1;
      pointer-events: auto !important;
    }
  }

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

    @media screen and (max-width: $mobile-width) {
      padding: 14px 10px 14px 10px;
    }

    &:hover {
      background-color: var(--bgcolor-alt-light);
    }
    &.selected {
      color: var(--theme-color);
    }
  }
}
</style>
