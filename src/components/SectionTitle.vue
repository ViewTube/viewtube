<template>
  <div class="section-title">
    <h2 class="title" :is="link ? 'router-link' : 'h2'" :to="link">
      {{ title }}
      <ChevronRightIcon v-if="link !== undefined" />
    </h2>
  </div>
</template>

<script>
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight'
import GradientBackground from '@/components/GradientBackground.vue'

export default {
  name: 'section-title',
  components: {
    ChevronRightIcon,
    GradientBackground
  },
  props: {
    title: String,
    link: String
  }
}
</script>

<style lang="scss" scoped>
.section-title {
  height: 80px;
  overflow: visible;
  position: relative;
  z-index: 9;
  display: block;
  width: 100%;

  .title {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    line-height: 80px;
    font-size: 1.7rem;
    text-align: start;
    padding: 0 0 0 20px;
    color: $title-color;
    box-sizing: border-box;
    z-index: 9;
    font-weight: bold;

    &:hover {
      .material-design-icon .material-design-icon__svg {
        left: -10px !important;
      }
    }

    .material-design-icon {
      height: 0.8em;
      width: 0.8em;

      .material-design-icon__svg {
        height: 1.2em !important;
        width: 1.2em !important;
        bottom: -9px !important;
        left: -5px !important;
        transition: left 300ms $dynamic-easing;
      }
    }
  }
}
</style>
