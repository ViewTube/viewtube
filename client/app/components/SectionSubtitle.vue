<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="section-subtitle">
    <h2 class="title">
      {{ title }}
    </h2>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.section-subtitle {
  display: block;

  .title {
    font-size: 1.1em;
    color: var(--subtitle-color);
  }
}
</style>
