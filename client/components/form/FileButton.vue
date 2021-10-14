<template>
  <label class="button">
    <div v-ripple class="label">{{ label }}</div>
    <input type="file" class="file-button" multiple="false" @change="$emit('change', $event)" />
  </label>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'FileButton',
  props: {
    label: String
  }
});
</script>

<style lang="scss" scoped>
.label {
  font-size: 1rem;
  border-style: none;
  width: calc(100% - 40px);
  text-align: center;
  cursor: pointer;
  user-select: none;
  margin: 20px 20px;
  background: $theme-color-primary-gradient;
  padding: 8px 0;
  border-radius: 5px;
  box-sizing: border-box;
  color: var(--title-color);
  box-shadow: $low-shadow;
  transition: box-shadow 300ms $intro-easing;
  display: inline-block;

  &:hover {
    box-shadow: $max-shadow;
  }
}

.button > input[type='file'] {
  display: none;
}
</style>
