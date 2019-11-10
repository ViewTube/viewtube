<template>
  <element class="section-title" is="router-link" :to="link">
    <div class="background" :class="{ gradient: gradient }">
      <span class="background-shadow"></span>
    </div>
    <h2 class="title">
      {{ title }}
      <ChevronRightIcon v-if="link !== undefined" />
    </h2>
  </element>
</template>

<script>
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight'

export default {
  name: 'section-title',
  components: {
    ChevronRightIcon
  },
  props: {
    title: String,
    gradient: Boolean,
    link: String
  }
}
</script>

<style lang="scss" scoped>
.section-title {
  height: 80px + $header-height;
  overflow: visible;
  position: relative;
  z-index: 9;
  display: block;

  .background {
    height: 700px + $header-height;
    position: relative;
    z-index: 9;
    opacity: 0;
    animation: gradient-flow 2s 400ms $intro-easing forwards;

    &.gradient {
      background: linear-gradient(
        165deg,
        rgba(226, 113, 59, 1) 0%,
        rgba(116, 20, 10, 1) 28%,
        rgba(18, 18, 18, 1) 69%,
        rgba(18, 18, 18, 1) 100%
      );
    }

    .background-shadow {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 700px + $header-height;
      width: 100%;
      background: linear-gradient(to bottom, transparent, $bgcolor-main);
    }
  }

  .title {
    position: absolute;
    top: $header-height;
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
    cursor: pointer;

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

@keyframes gradient-flow {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
