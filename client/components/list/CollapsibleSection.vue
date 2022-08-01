<template>
  <details class="collapsible-section" :open="open">
    <summary v-ripple class="collapsible-summary">
      <div class="title">
        <h3 class="title-text">{{ label }}</h3>
      </div>
    </summary>
    <transition name="section-collapse">
      <div class="section-container">
        <slot />
      </div>
    </transition>
  </details>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '#imports';

export default defineComponent({
  name: 'CollapsibleSection',
  components: {},
  props: {
    label: String,
    opened: Boolean
  },
  setup(props) {
    const open = ref(props.opened);

    watch(
      () => props.opened,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          open.value = Boolean(newValue);
        }
      }
    );

    return {
      open
    };
  }
});
</script>

<style lang="scss" scoped>
.section-collapse-enter-active,
.section-collapse-leave-active {
  transition: opacity 300ms $intro-easing;
}
.section-collapse-enter-to,
.section-collapse-leave-from {
  opacity: 1;
}
.section-collapse-enter-from,
.section-collapse-leave-to {
  opacity: 0;
}

.collapsible-section {
  display: flex;
  flex-direction: column;
  min-width: 340px;
  position: relative;

  .collapsible-summary {
    cursor: pointer;
    .title {
      cursor: pointer;
      display: inline-flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 20px 10px 15px 0;

      .icon {
        transition: transform 300ms $intro-easing;
        transform-origin: 50% 40%;

        &.inverted {
          transform: rotate(180deg);
        }
      }
    }
  }
}
</style>
