<script setup lang="ts">
defineProps<{
  errorMessage: string;
}>();
</script>

<template>
  <div class="channel-page-error-container">
    <div class="channel-page-error">
      <img class="channel-page-icon" src="~/assets/icon-error.svg" alt="Viewtube broken logo" />
    </div>
    <p class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style lang="scss" scoped>
.channel-page-error-container {
  height: 90vh;
  display: flex;
  flex-direction: column;
  margin: 25px 0 0 0;
  align-items: center;
  gap: 10px;

  .channel-page-error {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, transparent 50%, var(--bgcolor-main));
    }

    .channel-page-icon {
      margin: auto;
      width: 100px;
      height: 100px;
    }
  }
}
</style>
