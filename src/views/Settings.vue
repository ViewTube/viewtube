<template>
  <div class="settings" @scroll="$emit('scroll', $event)">
    <vue-headful title="Settings - ViewTube" />
    <h1>This is the settings page</h1>
  </div>
</template>

<style lang="scss">
.settings {
  margin-top: $header-height;
}
</style>
