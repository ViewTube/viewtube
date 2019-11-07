<template>
  <div class="section-title">
    <div class="background">
      <span class="background-shadow"></span>
    </div>
    <h2 class="title">{{ title }}</h2>
  </div>
</template>

<script>
export default {
  name: 'section-title',
  props: {
    title: String
  }
}
</script>

<style lang="scss" scoped>
.section-title {
  height: 80px;
  overflow: visible;
  position: relative;
  z-index: 9;

  .background {
    height: 400px;
    position: relative;

    background: linear-gradient(
      to top left,
      $theme-color-alt 0%,
      $theme-color-light 120%
    );

    .background-shadow {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 400px;
      width: 100%;
      background: linear-gradient(
        to bottom,
        transparent,
        $bgcolor-main
      );
    }
  }

  .title {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    line-height: 80px;
    font-size: 2rem;
    text-align: start;
    padding: 0 0 0 10px;
    color: $title-color;
    box-sizing: border-box;
  }
}
</style>
