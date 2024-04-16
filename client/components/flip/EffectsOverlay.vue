<script setup lang="ts">
const uiState = inject<UIState>('uiState');
const visibleEffects = computed<any>(() => uiState.visibleEffects);
</script>

<template>
  <div class="effects-overlay">
    <FlipEffect
      v-for="effect in visibleEffects"
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
