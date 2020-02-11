<template>
  <div id="app" :class="`theme--${$store.getters.theme}`">
    <Header v-if="!headless" />
    <vue-progress-bar :class="{ 'progress-bar-margin': !headless }"></vue-progress-bar>
    <Miniplayer v-if="$store.getters.miniplayer"></Miniplayer>
    <router-view class="content" ref="content" />
    <portal-target class="dropdown-portal" name="dropdown" multiple></portal-target>
    <MessageBoxContainer />
  </div>
</template>

<script>
import Header from '@/components/Header'
import '@/fonts/expletus.css'
import '@/fonts/notosans.css'
import Miniplayer from '@/components/miniplayer/Miniplayer'
import MessageBoxContainer from '@/components/message/MessageBoxContainer'

export default {
  name: 'app',
  components: {
    Header,
    Miniplayer,
    MessageBoxContainer
  },
  data: () => ({
  }),
  computed: {
    headless() {
      return this.$route.meta.headless
    }
  },
  created() {
    this.$Progress.start()

    this.$router.beforeEach((to, from, next) => {
      if (to.meta.progress !== undefined) {
        const meta = to.meta.progress
        this.$Progress.parseMeta(meta)
      }
      this.$Progress.start()

      next()
    })
  }
}
</script>

<style lang="scss">
* {
  scrollbar-color: #ff7b3b #1e1e1e;
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
    background: #1e1e1e;
  }

  &::-webkit-scrollbar-thumb {
    background: #ff7b3b;
    border-radius: 0;
    -webkit-border-radius: 0;
  }

  &::-webkit-scrollbar-corner {
    background: #1e1e1e;
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
.badge-btn {
  background-color: var(--bgcolor-alt);
  text-decoration: none;
  color: var(--title-color);
  padding: 2px 4px;
  margin: 2px 5px 2px 0;
  border-radius: 3px;
  display: inline-block;
  transition: background-color 200ms $intro-easing, border 200ms $intro-easing;
  border: 2px solid var(--theme-color-translucent);

  &:hover {
  }

  &:active {
    // border: 2px solid transparent;
  }
}
html,
body {
  overflow: hidden;
  overscroll-behavior: none;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: var(--bgcolor-main);

  #app {
    font-family: "noto-sans", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--title-color);
    height: 100%;
    width: 100%;
    background-color: var(--bgcolor-main);

    .dropdown-portal {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      pointer-events: none;
      user-select: none;

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
}
</style>
