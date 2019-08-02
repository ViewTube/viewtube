<template>
  <div id="app">
    <Header />
    <router-view class="content" />
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
export default {
  name: 'app',
  components: {
    Header
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
