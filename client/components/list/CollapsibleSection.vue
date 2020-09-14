<template>
  <div class="collapsible-section">
    <div v-ripple class="title" @click.prevent="toggleSection()">
      <h3 class="title-text">{{ label }}</h3>
      <ArrowDownIcon class="icon" :class="{ inverted: open }" />
    </div>
    <transition name="section-collapse">
      <div v-show="open" class="section-container">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script>
import ArrowDownIcon from 'vue-material-design-icons/ChevronDown';
export default {
  name: 'CollapsibleSection',
  components: {
    ArrowDownIcon
  },
  props: {
    label: String,
    opened: Boolean
  },
  data: () => ({
    open: false
  }),
  watch: {
    opened(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.open = Boolean(newValue);
      }
    }
  },
  mounted() {
    if (this.opened) {
      this.open = this.opened;
    }
  },
  methods: {
    toggleSection() {
      this.open = !this.open;
    }
  }
};
</script>

<style lang="scss" scoped>
.section-collapse-enter-active,
.section-collapse-leave-active {
  transition: opacity 300ms $intro-easing;
}
.section-collapse-enter-to,
.section-collapse-leave {
  opacity: 1;
}
.section-collapse-enter,
.section-collapse-leave-to {
  opacity: 0;
}

.collapsible-section {
  display: flex;
  flex-direction: column;
  min-width: 340px;
  position: relative;

  .title {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px 10px 15px 10px;
    position: sticky;
    top: 0;

    .icon {
      transition: transform 300ms $intro-easing;
      transform-origin: 50% 40%;

      &.inverted {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
