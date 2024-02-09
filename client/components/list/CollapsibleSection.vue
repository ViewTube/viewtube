<script setup lang="ts">
defineProps<{
  label: string;
  opened?: boolean;
}>();
</script>

<template>
  <details class="collapsible-section" :open="opened">
    <summary class="collapsible-summary">
      <div class="title">
        <p class="title-text">{{ label }}</p>
      </div>
    </summary>
    <div class="section-container">
      <slot />
    </div>
  </details>
</template>

<style lang="scss" scoped>
.collapsible-section {
  display: flex;
  flex-direction: column;
  position: relative;

  .collapsible-summary {
    cursor: pointer;
    padding: 5px 0;
    border-radius: 5px;

    &:hover {
      background-color: var(--bgcolor-alt-light);
    }

    .title {
      cursor: pointer;
      display: inline-flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 0;
    }
  }
}
</style>
