<script setup lang="ts">
const props = defineProps<{
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

const { jsEnabled } = useJsEnabled();

const pageElementRefs = ref<Array<HTMLElement>>([]);

const selectedElement = computed(() => {
  return pageElementRefs.value.find(element => element.dataset.pageName === props.currentPage);
});

const selectedElementPositionX = computed(() => {
  return `${selectedElement.value?.offsetLeft ?? 0}px`;
});

const selectedElementWidth = computed(() => {
  return `${selectedElement.value?.offsetWidth ?? 0}px`;
});

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
      ref="pageElementRefs"
      :href="page.link"
      class="tab-link"
      :data-page-name="page.pageName"
      :class="{
        active: page.pageName === currentPage,
        'active-simple': page.pageName === currentPage && !jsEnabled
      }"
      @click.prevent="onPageLinkClick(page.pageName)"
    >
      {{ page.title }}
    </a>
  </div>
</template>

<style lang="scss" scoped>
.tab-menu {
  display: flex;
  gap: 10px;
  position: relative;

  .tab-link {
    padding: 0 15px;
    text-decoration: none;
    border-radius: 5px;
    height: 35px;
    line-height: 35px;
    text-align: center;

    &.active-simple {
      background-color: var(--bgcolor-alt-light);
      box-shadow: $low-shadow;
    }

    &::after {
      display: none;
    }
  }

  .active-selector {
    position: absolute;
    top: 0;
    left: v-bind(selectedElementPositionX);
    height: 35px;
    width: v-bind(selectedElementWidth);
    border-radius: 5px;
    box-shadow: $low-shadow;
    background-color: var(--bgcolor-alt-light);
    transition: left 300ms $intro-easing, width 300ms $intro-easing, height 150ms $intro-easing,
      top 150ms $intro-easing;
  }
}
</style>
