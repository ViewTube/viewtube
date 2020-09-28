<template>
  <div v-ripple v-tippy="optionName" class="share-option" @click="onClick">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ShareOptionEntry',
  props: {
    optionName: String,
    click: Function
  },
  methods: {
    onClick() {
      this.click();
    }
  }
};
</script>

<style lang="scss">
.share-option {
  background-color: var(--bgcolor-alt);
  text-decoration: none;
  color: var(--title-color);
  margin: 2px 5px 2px 0;
  border-radius: 3px;
  display: inline-block;
  transition: background-color 200ms $intro-easing, border 200ms $intro-easing;
  border: 2px solid var(--theme-color-translucent);
  width: auto;
  white-space: nowrap;
  display: flex;
  flex-direction: column;

  &:hover {
    cursor: pointer;
  }
}
</style>
