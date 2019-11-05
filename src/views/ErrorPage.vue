<template>
  <div class="error-page">
    <div class="error-container">
      <h1 class="error-1">404</h1>
      <h1 class="error-2">404</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'error-page',
  methods: {
    retry () {
      window.location.reload()
    }
  },
  mounted: function () {
    this.$Progress.fail()
  }
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .error-container {
    margin: auto;
    width: 100%;
    height: 100%;
    text-align: center;
    position: relative;

    h1 {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      font-size: 50vw;
      width: 100%;
      overflow: hidden;
      text-overflow: wrap;
      color: transparent;
      background-image: url("/img/blur-bg-medium-dark.jpg");
      background-repeat: repeat;
      background-size: 100% 100%;
      background-clip: text;
      -webkit-background-clip: text;

      &.error-1 {
        text-shadow: 0 0 5px $theme-color;
      }

      &.error-2 {
      }
    }
  }
}
</style>
