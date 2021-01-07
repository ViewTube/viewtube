<template>
  <div id="app" ref="app" class="layout" :class="getAppClass()">
    <!-- <span
      class="reload-element"
      :style="{
        transform: `translate3d(0,${reloadElDistance}px,0)`
      }"
    /> -->
    <ThemeStyling />
    <Header v-if="!headless" class="main-header" />
    <Miniplayer v-if="$store.getters.miniplayer" />
    <nuxt />
    <portal-target class="dropdown-portal" name="dropdown" multiple />
    <portal-target class="popup-portal" name="popup" multiple />
    <MessageBoxContainer />
  </div>
</template>

<script lang="ts">
import Header from '@/components/header/MainHeader.vue';
import Miniplayer from '@/components/miniplayer/Miniplayer.vue';
import MessageBoxContainer from '@/components/message/MessageBoxContainer.vue';
import ThemeStyling from '@/components/themes/ThemeStyling.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'Default',
  components: {
    Header,
    Miniplayer,
    MessageBoxContainer,
    ThemeStyling
  },
  data() {
    return {
      touchTopY: 0,
      reloadElDistance: 0,
      reloadAnimating: false
    };
  },
  computed: {
    headless(): boolean {
      return this.$route.meta.headless;
    }
  },
  mounted() {
    if (this.$store.getters['instances/instances'].length === 0) {
      this.$store.dispatch('instances/fetchInstances');
    }
    this.$refs.app.classList += ` ${this.getThemeClass()}`;
  },
  methods: {
    getThemeClass(): string {
      if ((process as any).browser) {
        return `theme--${this.$store.getters['settings/theme']}`;
      } else {
        return 'theme--default';
      }
    },
    getAppClass(): string {
      let appClass = this.getThemeClass();

      if (this.reloadAnimating) {
        appClass += ' animating';
      }
      return appClass;
    },
    onTouchStart(e): void {
      this.touchTopY = e.touches[0].pageY;
    },
    onTouchMove(e): void {
      const topY = e.touches[0].pageY;
      const topDistance = topY - this.touchTopY;
      if (window.pageYOffset === 0 && topY > this.touchTopY) {
        this.reloadAnimating = false;
        this.reloadElDistance = Math.sqrt(topDistance * 50) - 20;
      } else {
        this.reloadElDistance = 0;
        this.reloadAnimating = true;
      }
    },
    onTouchEnd(): void {
      if (this.reloadElDistance > 100) {
        this.reloadElDistance = 100;
        this.reloadAnimating = true;
        window.location.reload();
      } else {
        this.reloadElDistance = 0;
        this.reloadAnimating = true;
      }
    }
  }
});
</script>

<style lang="scss">
#app {
  font-family: 'noto-sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--title-color);
  background-color: var(--bgcolor-main);

  &.animating {
    transition: transform 300ms $intro-easing;
  }

  .reload-element {
    position: fixed;
    top: -50px;
    height: 50px;
    width: 50px;
    left: calc(50% - 50px);
    background-color: var(--theme-color);
    z-index: 1001;
  }

  .dropdown-portal,
  .popup-portal {
    position: fixed;
    top: 0;
    height: 100vh;
    left: 0;
    right: 0;
    pointer-events: none;
    z-index: 901;

    > * {
      user-select: auto;
      pointer-events: auto;
    }
  }

  .dropdown-portal {
    z-index: 902;
  }

  .progress-bar-margin {
    top: $header-height - 3px !important;
  }

  .content {
    width: 100%;
    box-sizing: border-box;
  }
}
* {
  scrollbar-color: var(--theme-color) transparent;
  scrollbar-width: thin;
  touch-action: manipulation;

  &::selection {
    background: var(--theme-color);
    color: var(--title-color);
  }

  &::-moz-selection {
    background: var(--theme-color);
  }

  &::-webkit-scrollbar {
    height: 6px;
    width: 6px;
    background: var(--bgcolor-main);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--theme-color);
    border-radius: 0;
    -webkit-border-radius: 0;
  }

  &::-webkit-scrollbar-corner {
    background: var(--bgcolor-main);
  }
}
.ripple * {
  pointer-events: none !important;
}
body.transition-all * {
  transition: background-color 300ms ease, color 300ms ease, opacity 300ms ease;
}
p,
h1,
h2,
h3,
h4,
h5,
h6,
a {
  margin: 0;
}
div.links,
span.links {
  a {
    text-decoration: none;
    color: var(--theme-color-alt);
    position: relative;
    transition: background-size 300ms $dynamic-easing, color 300ms $intro-easing;
    background-image: $theme-color-primary-gradient;
    background-size: 0% 2px;
    background-position: 0 100%;
    background-repeat: no-repeat;

    &:hover {
      color: var(--theme-color);
      background-size: 100% 2px;
    }
  }
}
html,
body,
#__layout,
#__nuxt {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: var(--bgcolor-main);
}
.material-design-icon {
  position: relative;
  width: 24px;
  height: 24px;
  display: inline-block;
}

div,
p {
  font-family: noto-sans, Arial, sans-serif;
}

.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

a,
button {
  position: relative;
  &::after {
    box-shadow: 0 0 0 2px transparent;
    transition: box-shadow 100ms linear;
    content: '';
    position: absolute;
    left: 2px;
    top: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    pointer-events: none;
    user-select: none;
    z-index: +1;
    border-radius: inherit;
  }

  &:focus {
    &::after {
      box-shadow: 0 0 0 2px var(--theme-color);
    }
    outline: none;
  }
}

input:focus {
  outline: solid 2px var(--theme-color);
}

textarea:focus {
  outline: none;
}

a {
  text-decoration: none;
  color: unset;
}
</style>
