<template>
  <div class="dropdown">
    <div class="dropdown-btn">
      <p class="dropdown-title">{{ values[selected] }}</p>
    </div>
    <div class="dropdown-list">
      <span
        class="list-entry"
        v-for="(item, id) in values"
        :key="id"
        @click="select"
      >{{ item.value }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'submit-button',
  props: {
    values: Array
  },
  data: function () {
    return {
      selected: 0
    }
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
