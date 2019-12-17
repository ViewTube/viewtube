<template>
  <div class="spinner">
    <div class="rect rect1"></div>
    <div class="rect rect2"></div>
    <div class="rect rect3"></div>
    <div class="rect rect4"></div>
    <div class="rect rect5"></div>
  </div>
</template>

<script>
export default {
  name: 'spinner'
}
</script>

<style lang="scss">
.spinner {
  margin: auto;
  width: 50px;
  height: 40px;
  text-align: center;
  font-size: 10px;
  $rectangle-width: 6px;
  user-select: none;

  .rect {
    background-image: var(--theme-color-gradient);
    background-size: $rectangle-width * 5;
    background-position: 0;
    height: 100%;
    width: $rectangle-width;
    display: inline-block;
    animation: spinner 1.2s infinite ease-in-out;
    margin: 0 1px;
  }

  .rect2 {
    animation-delay: -1.1s;
    background-position: -$rectangle-width;
  }

  .rect3 {
    animation-delay: -1s;
    background-position: -$rectangle-width * 2;
  }

  .rect4 {
    animation-delay: -0.9s;
    background-position: -$rectangle-width * 3;
  }

  .rect5 {
    animation-delay: -0.8s;
    background-position: -$rectangle-width * 4;
  }

  &.invisible {
    display: none;
  }
}

@keyframes spinner {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}
</style>
