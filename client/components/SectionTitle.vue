<template>
  <div class="section-title">
    <h2 :is="link ? 'nuxt-link' : 'h2'" class="title" :to="link">
      {{ title }}
      <ChevronRightIcon v-if="link !== undefined" />
    </h2>
    <span class="line" />
    <slot />
  </div>
</template>

<script>
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight';
import GradientBackground from '@/components/GradientBackground.vue';

export default {
  name: 'SectionTitle',
  components: {
    ChevronRightIcon,
    GradientBackground
  },
  props: {
    title: String,
    link: String
  }
};
</script>

<style lang="scss" scoped>
.section-title {
  height: 80px;
  overflow: visible;
  position: relative;
  z-index: 9;
  display: block;
  width: 100%;
  display: flex;
  flex-direction: row;

  .title {
    position: relative;
    top: 0;
    max-width: $main-width;
    margin: 0;
    line-height: 80px;
    font-size: 1.7rem;
    text-align: start;
    padding: 0;
    color: var(--title-color);
    box-sizing: border-box;
    z-index: 9;
    font-weight: bold;

    &:hover {
      .material-design-icon {
        left: -10px !important;
      }
    }

    .material-design-icon {
      height: 0.8em;
      width: 0.8em;
      top: 9px !important;
      height: 1.2em !important;
      width: 1.2em !important;
      left: 0;
      transition: left 300ms $intro-easing;

      .material-design-icon__svg {
        height: 1.2em !important;
        width: 1.2em !important;
        bottom: -9px !important;
      }
    }
  }
  .line {
    height: 2px;
    flex-grow: 1;
    background: linear-gradient(to right, transparent 5%, var(--theme-color-translucent) 15%);
    position: relative;
    top: 50%;
    display: block;
  }
}
</style>
