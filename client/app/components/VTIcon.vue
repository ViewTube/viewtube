<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string;
    width?: string;
    height?: string;
  }>(),
  {
    width: '1.5rem',
    height: '1.5rem'
  }
);

const iconName = computed((): string => {
  if (!props.name) return '';
  return `i-${props.name.replace(':', '-')}`;
});
</script>

<template>
  <div :class="iconName" class="vt-icon" />
</template>

<style lang="scss" scoped>
.vt-icon {
  display: inline-block;
  position: relative;
  width: v-bind(width);
  height: v-bind(height);
  font-size: 16px;
}
</style>
