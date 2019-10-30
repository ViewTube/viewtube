<template>
  <div id="app">
    <Header />
    <vue-progress-bar class="progress-bar"></vue-progress-bar>
    <router-view class="content" ref="content" />
  </div>
</template>

<script>
import Header from '@/components/Header.vue'

export default {
  name: 'app',
  components: {
    Header
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
  }
}
</script>

<style lang="scss">
* {
  scrollbar-color: #ff7b3b #1e1e1e;
  scrollbar-width: thin;
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
      padding-top: $header-height;
      height: 100%;
      width: 100%;
      overflow-x: auto;
      box-sizing: border-box;
    }
  }
}
</style>
