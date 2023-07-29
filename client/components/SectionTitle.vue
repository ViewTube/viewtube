<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    link?: string;
    line?: boolean;
  }>(),
  {
    line: true,
    link: null
  }
);
</script>

<template>
  <div class="section-title">
    <nuxt-link v-if="link" class="title" :to="link">
      {{ title }}
      <VTIcon name="mdi:chevron-right" />
    </nuxt-link>
    <h2 v-else class="title">
      {{ title }}
    </h2>
    <span v-if="line" class="line" />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.section-title {
  height: 80px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  .title {
    max-width: $main-width;
    font-size: 1.7rem;
    box-sizing: border-box;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover {
      .material-design-icon {
        transform: translateX(-10px);
      }
    }

    .material-design-icon,
    .material-design-icon__svg {
      height: 1.2em;
      width: 1.2em;
      transition: transform 300ms $intro-easing;
    }
  }
  .line {
    height: 2px;
    flex-grow: 1;
    background: linear-gradient(to right, transparent 5%, var(--theme-color-translucent) 15%);
  }
}
</style>
