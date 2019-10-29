<template>
  <input type="submit" :value="label" class="submit-button ripple" />
</template>

<script>
export default {
  name: 'submit-button',
  props: {
    label: String
  }
}
</script>

<style lang="scss" scoped>
.submit-button {
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
  color: $title-color;
  box-shadow: $low-shadow;
  transition: box-shadow 300ms $intro-easing;

  &:hover {
    box-shadow: $max-shadow;
  }
}
</style>
