<script setup lang="ts">
defineProps<{
  pages: Array<{
    title: string;
    link: string;
    pageName: string;
  }>;
  currentPage: string;
}>();

const emit = defineEmits<{
  (event: 'changePage', url: string): void;
}>();

const onPageLinkClick = (pageName: string) => {
  emit('changePage', pageName);
};
</script>

<template>
  <div class="tab-menu">
    <div class="active-selector" />
    <a
      v-for="page in pages"
      :key="page.title"
      :href="page.link"
      class="tab-link"
      :class="{ active: page.pageName === currentPage }"
      @click.prevent="() => onPageLinkClick(page.pageName)"
      >{{ page.title }}</a
    >
  </div>
</template>

<style lang="scss" scoped>
.tab-menu {
  display: flex;
  gap: 10px;
  position: relative;

  .tab-link {
    padding: 5px 15px;
    text-decoration: none;
    border-radius: 5px;
  }

  .active-selector {
    position: absolute;
    top: 5px;
    left: 0;
    height: 25px;
    width: 20px;
    border-radius: 5px;
    box-shadow: $low-shadow;
    background-color: var(--bgcolor-alt-light);
    transition: left 0.2s ease-in-out, width 0.2s ease-in-out;
  }
}
</style>
