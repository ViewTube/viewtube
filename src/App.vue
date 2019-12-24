<template>
  <div id="app" :class="`theme--${settings.getTheme()}`">
    <Header :scrollTop="scrolledTop" v-if="!headless" />
    <vue-progress-bar :class="{ 'progress-bar-margin': !headless }"></vue-progress-bar>
    <router-view class="content" ref="content" @scroll="handleScroll" />
    <portal-target class="dropdown-portal" name="dropdown" multiple></portal-target>
  </div>
</template>

<script>
import Header from '@/components/Header'
import '@/fonts/expletus.css'
import SettingsStore from '@/store/settings'

export default {
  name: 'app',
  components: {
    Header
  },
  data: () => ({
    scrolledTop: false,
    settings: SettingsStore,
    theme: SettingsStore.theme
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
        let meta = to.meta.progress
        this.$Progress.parseMeta(meta)
      }
      this.$Progress.start()

      next()
    })
  },
  methods: {
    handleScroll(e) {
      this.scrolledTop = e.target.scrollTop > 5
    }
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
    font-family: "Roboto", Helvetica, Arial, sans-serif;
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
      top: $header-height !important;
    }

    .content {
      height: 100%;
      width: 100%;
      box-sizing: border-box;
    }
  }
}
</style>
