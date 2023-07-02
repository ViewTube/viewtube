<script setup lang="ts">
defineProps<{ text: string }>();
</script>

<template>
  <div class="error">
    <div class="container">
      <Icon name="mdi:alert-circle-outline" class="icon" />
      <p class="text">{{ text }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;

  .container {
    width: calc(100% - 40px);
    max-width: 250px;
    margin: auto;
    display: flex;
    flex-direction: row;

    .icon {
      align-self: center;
      margin: 0 10px 0 0;
      color: var(--theme-color);
    }
  }
}
</style>
