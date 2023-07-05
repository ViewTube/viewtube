<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();

const IconComponent = defineAsyncComponent(() => {
  const iconName = props.name.replace(/:/g, '/');
  return import(/* @vite-ignore */ `~icons/${iconName}.vue`);
});
</script>

<template>
  <IconComponent />
</template>
