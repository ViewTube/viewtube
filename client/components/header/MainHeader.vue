<script setup lang="ts">
import MainSearchBox from '@/components/MainSearchBox.vue';
import UserMenu from '@/components/header/UserMenu.vue';

const { posAbsolute, topPositionPx } = useHeaderScroll();
</script>

<template>
  <div class="header" :class="{ absolute: posAbsolute }">
    <nuxt-link class="logo-link" to="/">
      <h1 class="logo">
        <span>View</span>
        <span class="logo-colored">Tube</span>
      </h1>
      <img class="logo-small" src="@/assets/icon.svg" alt="ViewTube" />
    </nuxt-link>
    <MainSearchBox />
    <UserMenu />
  </div>
</template>

<style lang="scss">
.header {
  height: $header-height;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 800;
  background-color: var(--header-transparent);
  backdrop-filter: blur(10px);
  top: v-bind(topPositionPx);

  transition: box-shadow 300ms $intro-easing, background-color 300ms $intro-easing,
    transform 300ms $dynamic-easing;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: -100%;
    height: $header-height;
    width: 100%;
    background-color: var(--header-bgcolor);
  }

  &.absolute {
    position: absolute;
  }

  .logo-link {
    text-decoration: none;
    margin: auto 10px auto 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    position: relative;
    z-index: +1;

    .logo {
      font-family: $header-font;
      font-size: 1.5rem;
      color: var(--title-color);
      width: auto;
      overflow: hidden;
      white-space: nowrap;
      transition: width 300ms linear;
      display: flex;
      margin: 4px 0 0 0;

      span {
        display: block;
      }

      .logo-colored {
        color: transparent;
        background-image: var(--theme-color-gradient);
        background-clip: text;
        -webkit-background-clip: text;
      }
    }

    .logo-small {
      margin: auto;
      height: calc(#{$header-height} - 20px);
      transform: scale(0.8) translateY(-2px);
      transition: clip-path 300ms $intro-easing, transform 300ms linear;
    }

    @media screen and (max-width: $mobile-width) {
      width: 40px;

      .logo {
        width: 0;
      }

      .logo-small {
        display: block;
        transform: scale(1);
      }
    }
  }

  a {
    outline: 0;

    &:hover,
    &:focus,
    &:target {
      outline: 0;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      background-color: transparent;
    }
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    &:active {
      background-color: transparent !important;
    }
  }
}
</style>
