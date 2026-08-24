<template>
  <div v-ripple v-tippy="optionName" class="share-option" @click="onClick">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  optionName: string;
  click: () => void;
}>();

const onClick = () => {
  props.click();
};
</script>

<style lang="scss">
.share-option {
  background-color: var(--bgcolor-alt);
  text-decoration: none;
  color: var(--title-color);
  border-radius: 3px;
  transition:
    background-color 200ms variables.$intro-easing,
    border 200ms variables.$intro-easing;
  border: 2px solid var(--theme-color-translucent);
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  height: 46px;
  width: 46px;
  margin: 4px 4px 4px 0;

  .vt-icon {
    margin: 4px;
    height: 38px;
    width: 38px;
    position: unset;
  }

  img {
    width: 50px;
    margin: -1px 0 0 8px;
  }

  &:hover {
    cursor: pointer;
  }
}
</style>
