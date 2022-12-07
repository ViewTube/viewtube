<script setup lang="ts">
defineProps<{
  pages: Array<{
    title: string;
    link: string;
  }>;
}>();
</script>

<template>
  <div class="tab-menu">
    <div v-for="page in pages" :key="page.title" class="tab-item">
      <NuxtLink :to="page.link" class="tab-link">
        {{ page.title }}
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-menu {
  display: flex;
  gap: 10px;
  .tab-item {
    padding: 5px 10px;

    .tab-link {
    }
  }
}
</style>
