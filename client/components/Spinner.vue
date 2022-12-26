<template>
  <div class="spinner">
    <div class="rect rect1" />
    <div class="rect rect2" />
    <div class="rect rect3" />
    <div class="rect rect4" />
    <div class="rect rect5" />
  </div>
</template>

<style lang="scss">
.spinner {
  margin: auto;
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 10px;
  $rectangle-width: 8px;
  user-select: none;
  display: flex;
  flex-direction: row;
  pointer-events: none;
  gap: 2px;

  .rect {
    background-image: var(--theme-color-gradient);
    background-size: $rectangle-width * 5;
    height: 100%;
    width: $rectangle-width;
    display: block;
    animation: spinner 2s infinite $dynamic-easing;
    margin: auto 0;
    border-radius: 25px;
  }

  @for $r from 1 through 5 {
    .rect#{$r} {
      animation-delay: -1.2s + 0.1s * $r;
      background-position: -$rectangle-width * ($r - 1);
    }
  }

  &.invisible {
    display: none;
  }
}

@keyframes spinner {
  0% {
    height: 8px;
    transform: translateY(0);
  }
  20% {
    height: 8px;
    transform: translateY(-5px);
  }
  40% {
    height: 8px;
    transform: translateY(16px);
  }
  60% {
    height: 40px;
    transform: translateY(0);
  }
  80% {
    height: 8px;
  }
  100% {
    height: 8px;
  }
}
</style>
