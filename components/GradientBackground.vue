<template>
  <div class="gradient-container">
    <div
      class="gradient-background"
      :class="color"
    >
      <span class="background-shadow" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'GradientBackground',
  props: {
    color: {
      type: String,
      default: 'theme'
    }
  },
  data: () => ({
  })
}
</script>

<style lang="scss" scoped>
.gradient-container {
  height: $header-height;
  overflow: visible;
  position: relative;
  z-index: 9;
  display: block;
  width: 100%;
  opacity: var(--gradient-opacity);

  .gradient-background {
    height: 600px + $header-height;
    position: relative;
    z-index: 9;
    opacity: 1;

    &[hide="true"] {
      opacity: 0;
    }

    &.theme {
      background: linear-gradient(
        165deg,
        rgba(241, 87, 10, 0.705) 0%,
        rgba(116, 21, 10, 0.801) 28%,
        rgba(18, 18, 18, 1) 69%,
        rgba(18, 18, 18, 1) 100%
      );
    }

    &.blue {
      background: linear-gradient(
        165deg,
        rgb(16, 141, 199) 0%,
        rgb(9, 74, 104) 28%,
        rgba(18, 18, 18, 1) 69%,
        rgba(18, 18, 18, 1) 100%
      );
    }

    &.green {
      background: linear-gradient(
        165deg,
        rgb(12, 129, 61) 0%,
        rgb(6, 71, 6) 28%,
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
      background: linear-gradient(to bottom, transparent, var(--bgcolor-main));
    }
  }
}

// @keyframes gradient-flow {
//   0% {
//     opacity: 0;
//   }
//   100% {
//     opacity: 1;
//   }
// }
</style>
