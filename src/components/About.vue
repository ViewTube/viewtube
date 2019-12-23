<template>
  <div class="about popup">
    <div class="about-container popup-container">
      <CloseIcon class="close-icon" @click.stop="$emit('close')" />
      <h1>About</h1>
    </div>
    <div class="about-overlay popup-overlay" @click.stop="$emit('close')"></div>
  </div>
</template>

<script>
import CloseIcon from 'icons/Close'
export default {
  name: 'about',
  components: {
    CloseIcon
  }

}
</script>

<style>
</style>
