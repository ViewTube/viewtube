<template>
  <div v-ripple v-tippy="optionName" class="share-option" @click="onClick">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'ShareOptionEntry',
  props: {
    optionName: { type: String, required: true },
    click: Function as PropType<() => {}>
  },
  setup(props) {
    const onClick = () => {
      props.click();
    };

    return {
      onClick
    };
  }
});
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
