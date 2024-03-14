<script setup lang="ts">
const uiState = inject<UIState>('uiState');
const visibleEffects = computed<any>(() => uiState.visibleEffects);
</script>

<template>
  <div class="effects-overlay">
    <FlipEffect
      v-for="(effect, index) in visibleEffects"
      :key="index"
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
