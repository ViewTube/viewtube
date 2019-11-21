<template>
  <div id="app">
    <Header :scrollTop="scrolledTop" />
    <vue-progress-bar class="progress-bar"></vue-progress-bar>
    <router-view class="content" ref="content" @scroll="handleScroll" />
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import '@/fonts/expletus.css'

export default {
  name: 'app',
  components: {
    Header
  },
  data: function () {
    return {
      scrolledTop: false
    }
  },
  created: function () {
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
    handleScroll (e) {
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
    background: $theme-color;
  }

  &::-moz-selection {
    background: $theme-color;
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
  background-color: $bgcolor-main;
  overflow: hidden;
  overscroll-behavior: none;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;

  #app {
    font-family: "Roboto", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $title-color;
    background-color: $bgcolor-main;
    height: 100%;
    width: 100%;

    .progress-bar {
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
