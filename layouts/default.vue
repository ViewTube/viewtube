<template>
  <div
    id="app"
    ref="app"
    class="layout"
    :class="getThemeClass()"
  >
    <ThemeStyling />
    <Header
      v-if="!headless"
      class="main-header"
    />
    <Miniplayer v-if="$store.getters.miniplayer" />
    <nuxt v-scroll="handleScroll" />
    <portal-target
      class="dropdown-portal"
      name="dropdown"
      multiple
    />
    <portal-target
      class="popup-portal"
      name="popup"
      multiple
    />
    <MessageBoxContainer />
  </div>
</template>

<script>
import Header from '@/components/header/MainHeader'
import Miniplayer from '@/components/miniplayer/Miniplayer'
import MessageBoxContainer from '@/components/message/MessageBoxContainer'
import ThemeStyling from '@/components/themes/ThemeStyling'

export default {
  name: 'Index',
  components: {
    Header,
    Miniplayer,
    MessageBoxContainer,
    ThemeStyling
  },
  data() {
    return {
    }
  },
  computed: {
    headless() {
      return this.$route.meta.headless
    }
  },
  watch: {
    browser(oldVal, newVal) {
    }
  },
  mounted() {
    this.$store.dispatch('user/getUser')
    this.$refs.app.classList += ` ${this.getThemeClass()}`
  },
  methods: {
    handleScroll(e, position) {
      this.$store.commit('scroll/setScrollPosition', position.scrollTop)
    },
    getThemeClass() {
      if (process.browser) {
        return `theme--${this.$store.getters['settings/theme']}`
      } else {
        return 'theme--default'
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: "noto-sans", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--title-color);
  height: 100%;
  width: 100%;
  background-color: var(--bgcolor-main);

  .dropdown-portal, .popup-portal {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    z-index: 901;

    > * {
      user-select: auto;
      pointer-events: auto;
    }
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
  scrollbar-color: var(--theme-color) var(--bgcolor-main);
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
div.links {
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
  overflow: hidden;
  overscroll-behavior: none;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: var(--bgcolor-main);
}
.material-design-icon {
  position: relative;
  width: 24px;
  height: 24px;
  display: inline-block;

  .material-design-icon__svg {
  }
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
div,
input {
  outline: none;
}

textarea:focus,
input:focus {
  outline: none;
}

a {
  text-decoration: none;
  color: unset;
}
</style>
