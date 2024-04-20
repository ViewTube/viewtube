<script setup lang="ts">
defineProps<{
  uiState: UIState;
}>();
</script>

<template>
  <div class="effects-overlay">
    <FlipEffect
      v-for="effect in uiState.visibleEffects.value"
      :key="effect.name"
      :name="effect.name"
      :duration="effect.duration"
      :position="effect.position"
    />
  </div>
</template>

<style lang="scss" scoped>
.effects-overlay {
  pointer-events: none;
  width: 100%;
  height: 100%;
  position: absolute;
}
</style>
