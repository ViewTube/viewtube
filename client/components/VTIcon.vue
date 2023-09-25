<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();

const iconName = computed((): string => {
  if (!props.name) {
    return '';
  }
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
  width: 1.5em;
  height: 1.5em;
  font-size: 16px;
}
</style>
