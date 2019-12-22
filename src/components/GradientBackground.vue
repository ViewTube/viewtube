<template>
  <div class="gradient-container">
    <div class="gradient-background" :class="color" :hide="settings.getTheme() !== 'default'">
      <span class="background-shadow"></span>
    </div>
  </div>
</template>

<script>
import SettingsStore from '@/store/settings'

export default {
  name: 'gradient-background',
  props: {
    color: String
  },
  data: () => ({
    settings: SettingsStore
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
  transform-origin: 0 0;
  transform: translateZ(-4px) scale(2);

  .gradient-background {
    height: 700px + $header-height;
    position: relative;
    z-index: 9;
    opacity: 1;

    &[hide="true"] {
      opacity: 0;
    }

    &.theme {
      background: linear-gradient(
        165deg,
        rgba(226, 113, 59, 1) 0%,
        rgba(116, 20, 10, 1) 28%,
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
