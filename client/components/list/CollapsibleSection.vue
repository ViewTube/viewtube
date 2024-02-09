<script setup lang="ts">
defineProps<{
  label: string;
  opened?: boolean;
}>();
</script>

<template>
  <details class="collapsible-section" :open="opened">
    <summary v-ripple class="collapsible-summary">
      <div class="title">
        <h3 class="title-text">{{ label }}</h3>
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
  min-width: 340px;
  position: relative;

  .collapsible-summary {
    cursor: pointer;
    padding: 0 10px;

    .title {
      cursor: pointer;
      display: inline-flex;
      flex-direction: row;
      justify-content: space-between;
      padding: 20px 10px 15px 0;
    }
  }
}
</style>
