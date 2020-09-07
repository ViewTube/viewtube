<template>
  <div class="bottom-navigation" />
</template>

<script>
export default {
  name: 'BottomNavigation'
};
</script>

<style lang="scss" scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  height: $header-height;
  width: 100%;
  z-index: 800;
  background-color: var(--header-bgcolor);
  display: none;
  box-shadow: $max-shadow;

  @media screen and (max-width: $mobile-width) {
    // display: block;
  }
}
</style>
