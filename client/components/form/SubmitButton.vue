<template>
  <input v-ripple type="submit" :value="label" class="submit-button" />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SubmitButton',
  props: {
    label: String
  }
});
</script>

<style lang="scss" scoped>
.submit-button {
  font-size: 1rem;
  border-style: none;
  text-align: center;
  cursor: pointer;
  user-select: none;
  background: $theme-color-primary-gradient;
  padding: 8px 0;
  border-radius: 5px;
  box-sizing: border-box;
  color: var(--title-color);
  box-shadow: $low-shadow;
  transition: box-shadow 300ms $intro-easing;

  &:hover {
    box-shadow: $max-shadow;
  }
}
</style>
